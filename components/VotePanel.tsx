import {
  ProgramAccount,
  TokenOwnerRecord,
  VoteRecord,
  withFinalizeVote,
  YesNoVote,
} from '@solana/spl-governance';
import { TransactionInstruction } from '@solana/web3.js';
import { useCallback, useState } from 'react';
import relinquishVotes from '../actions/relinquishVotes';
import { useHasVoteTimeExpired } from '../hooks/useHasVoteTimeExpired';
import useRealm from '../hooks/useRealm';
import { RpcContext } from '@solana/spl-governance';
import { GoverningTokenType } from '@solana/spl-governance';

import useWalletStore, {
  EnhancedProposalState,
} from '../stores/useWalletStore';
import Button from './Button';
import VoteCommentModal from './VoteCommentModal';
import { getProgramVersionForRealm } from '@models/registry/api';
import { VoteRegistryVoterWeight, VoterWeight } from '@models/voteWeights';
import { BN } from '@project-serum/anchor';
import { castVotes } from 'actions/castVotes';
import { notify } from '@utils/notifications';
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore';

export type AccountToVoteFor = {
  tokenRecord?: ProgramAccount<TokenOwnerRecord>;
  voterWeight?: VoteRegistryVoterWeight | VoterWeight;
  voteRecord?: ProgramAccount<VoteRecord>;
  voterTokenRecord?: ProgramAccount<TokenOwnerRecord>;
};

export type AccountsToVoteFor = AccountToVoteFor[];

function decideOfExecutableActions(
  sortedAccounts: SortedAccounts,
): {
  showSync?: true;
  showWithdraw?: true;
  showVoteYes?: true;
  showVoteNo?: true;
} {
  if (
    sortedAccounts.accountsThatHaveAlreadyVoted.length > 0 &&
    sortedAccounts.accountsReadyToVote.length > 0
  ) {
    return {
      showSync: true,
      showWithdraw: true,
    };
  }

  if (sortedAccounts.accountsReadyToVote.length > 0) {
    return {
      showVoteNo: true,
      showVoteYes: true,
    };
  }

  if (sortedAccounts.accountsThatHaveAlreadyVoted.length > 0) {
    return {
      showWithdraw: true,
    };
  }

  return {};
}

// Look at the casted votes and get the voteSide
function getVoteSide(
  accounts: AccountsToVoteFor,
): YesNoVote | 'conflicted' | null {
  return accounts.reduce((state, account) => {
    // Ignore accounts with un-casted votes
    if (!account.voteRecord?.account.vote) {
      return state;
    }

    const voteSide = account.voteRecord?.account.vote?.toYesNoVote();

    if (typeof voteSide === 'undefined') {
      return state;
    }

    if (state === null) {
      return voteSide;
    }

    if (state !== voteSide) {
      return 'conflicted';
    }

    return voteSide;
  }, null as YesNoVote | 'conflicted' | null);
}

type SortedAccounts = {
  accountsReadyToVote: AccountsToVoteFor;
  accountsThatHaveAlreadyVoted: AccountsToVoteFor;
  accountsWithoutVotingPower: AccountsToVoteFor;
};

function sortAccountsToVoteFor(
  accountsToVoteFor: AccountsToVoteFor,
): SortedAccounts {
  return accountsToVoteFor.reduce(
    (acc, account) => {
      // Ignore account without voterTokenRecord
      if (!account.voterTokenRecord) {
        return acc;
      }

      /*
      // Looking at voterWeight doesn't work
      if (
        account.voterTokenRecord &&
        account.voterWeight &&
        !account.voterWeight.hasMinAmountToVote(
          account.voterTokenRecord.account.governingTokenMint,
        )
      ) {
        acc.accountsWithoutVotingPower.push(account);
        return acc;
      }
      */
      if (
        account.voterTokenRecord.account.governingTokenDepositAmount.eq(
          new BN(0),
        )
      ) {
        acc.accountsWithoutVotingPower.push(account);
        return acc;
      }

      if (!account.voteRecord) {
        acc.accountsReadyToVote.push(account);
        return acc;
      }

      if (!account.voteRecord.account.isRelinquished) {
        acc.accountsThatHaveAlreadyVoted.push(account);
        return acc;
      }

      // Unexpected turn of event, ignore the account
      return acc;
    },
    {
      accountsReadyToVote: [],
      accountsThatHaveAlreadyVoted: [],
      accountsWithoutVotingPower: [],
    } as SortedAccounts,
  );
}

const VotePanel = () => {
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [vote, setVote] = useState<YesNoVote | null>(null);

  const {
    governance,
    proposal,
    voteRecordsByVoter,
    tokenType,
  } = useWalletStore((s) => s.selectedProposal);

  const {
    ownTokenRecord,
    ownCouncilTokenRecord,
    realmInfo,
    realm,
    ownVoterWeight,
    tokenRecords,
  } = useRealm();

  const client = useVoteStakeRegistryClientStore((s) => s.state.client);
  const wallet = useWalletStore((s) => s.current);
  const connection = useWalletStore((s) => s.connection);
  const fetchVoteRecords = useWalletStore((s) => s.actions.fetchVoteRecords);
  const fetchRealm = useWalletStore((s) => s.actions.fetchRealm);
  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!);

  // Look for accounts where the user is the delegate
  const getDelegatedAccounts = useCallback((): {
    address: string;
    nbToken: number;
  }[] => {
    if (!wallet?.publicKey) {
      return [];
    }

    return Object.entries(tokenRecords)
      .filter(([, value]) =>
        value.account.governanceDelegate?.equals(wallet.publicKey!),
      )
      .map(([key, value]) => ({
        address: key,
        nbToken: value.account.governingTokenDepositAmount
          .div(new BN(10 ** 6))
          .toNumber(),
      }));
  }, [wallet, tokenRecords]);

  const handleShowVoteModal = (vote: YesNoVote) => {
    setVote(vote);

    setShowVoteModal(true);
  };

  const handleCloseShowVoteModal = useCallback(() => {
    setShowVoteModal(false);
  }, []);

  // Show nothing if not connected
  if (!wallet?.publicKey) {
    return <></>;
  }

  const delegatedAccounts = getDelegatedAccounts();

  // Holds accounts we can vote for
  const accountsToVoteFor: AccountsToVoteFor = [
    // The user own account first
    {
      tokenRecord: ownTokenRecord,
      voterWeight: ownVoterWeight,
      voteRecord: voteRecordsByVoter[wallet.publicKey.toBase58()],
      voterTokenRecord:
        tokenType === GoverningTokenType.Community
          ? ownTokenRecord
          : ownCouncilTokenRecord,
    },

    // Then the delegated accounts
    ...delegatedAccounts.map(({ address: delegatedAccountAddress }) => ({
      tokenRecord: tokenRecords[delegatedAccountAddress],
      voterWeight: new VoterWeight(ownTokenRecord, ownCouncilTokenRecord),
      voteRecord: voteRecordsByVoter[delegatedAccountAddress],
      voterTokenRecord:
        tokenType === GoverningTokenType.Community
          ? tokenRecords[delegatedAccountAddress]
          : ownCouncilTokenRecord,
    })),
  ];

  // How to detect if an account have vote or not?
  // If voteRecord equals to undefined, then vote has not been casted
  // If voteRecord.account.isRelinquished then the vote has been relinquished
  const sortedAccounts = sortAccountsToVoteFor(accountsToVoteFor);

  // Decide which options should be displayed to the end user for this proposal regarding the vote states
  const {
    showSync,
    showWithdraw,
    showVoteNo,
    showVoteYes,
  } = decideOfExecutableActions(sortedAccounts);

  // There are more power available to vote, when votes are already committed
  const submitSyncVotes = async () => {
    const programId = realmInfo?.programId;
    const realmId = realmInfo?.realmId;

    const rpcContext = new RpcContext(
      proposal!.owner,
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection.current,
      connection.endpoint,
    );

    const voteSide = getVoteSide(sortedAccounts.accountsThatHaveAlreadyVoted);

    // Votes are conflicted, withdraw all, so we can start on a clean state again
    if (voteSide === 'conflicted') {
      await submitRelinquishVotes();

      notify({
        type: 'warn',
        message: `Committed votes are conflicted (Yes and No). Withdrawing all votes...`,
      });

      return;
    }

    if (voteSide === null) {
      notify({
        type: 'warn',
        message: `Programming error. We have not been able to detect vote side.`,
      });

      return;
    }

    try {
      await castVotes({
        rpcContext,
        realm: realm!,
        proposal: proposal!,

        tokenOwnerRecordsToVoteWith: sortedAccounts.accountsReadyToVote.map(
          (account) => account.voterTokenRecord!,
        ),

        vote: voteSide,
        client,
      });
    } catch (ex) {
      console.error("Can't cast vote", ex);
    }

    fetchVoteRecords(proposal);
    await fetchRealm(programId, realmId);
  };

  const submitRelinquishVotes = async () => {
    const programId = realmInfo?.programId;
    const realmId = realmInfo?.realmId;

    const rpcContext = new RpcContext(
      proposal!.owner,
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection.current,
      connection.endpoint,
    );

    try {
      const instructions: TransactionInstruction[] = [];

      if (
        proposal?.account.state === EnhancedProposalState.Voting &&
        hasVoteTimeExpired
      ) {
        await withFinalizeVote(
          instructions,
          realmInfo!.programId,
          getProgramVersionForRealm(realmInfo!),
          realm!.pubkey,
          proposal.account.governance,
          proposal.pubkey,
          proposal.account.tokenOwnerRecord,
          proposal.account.governingTokenMint,
        );
      }

      await relinquishVotes({
        rpcContext,
        proposal: proposal!,
        records: sortedAccounts.accountsThatHaveAlreadyVoted.map(
          ({ tokenRecord, voteRecord }) => ({
            tokenOwnerRecord: tokenRecord!.pubkey,
            voteRecord: voteRecord!.pubkey,
          }),
        ),

        instructions,
      });
    } catch (ex) {
      console.error("Can't relinquish vote", ex);
    }

    await fetchRealm(programId, realmId);
  };

  const isVoting =
    proposal?.account.state === EnhancedProposalState.Voting &&
    !hasVoteTimeExpired;

  const getActionLabel = () => {
    if (!isVoting) {
      return 'Release your tokens';
    }

    if (showVoteYes || showVoteNo) {
      return 'Cast your vote';
    }

    if (showSync) {
      return 'Sync or withdraw your vote';
    }

    return 'Withdraw your vote';
  };

  const actionLabel = getActionLabel();

  // Nothing to do, nothing to display
  if (!showWithdraw && !showVoteYes && !showVoteNo && !showSync) {
    return <></>;
  }

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4">
      <h3 className="mb-4 text-center">{actionLabel}</h3>

      <div className="flex w-full justify-center">
        {delegatedAccounts.length ? (
          <div className="text-xs">
            <span className="ml-1 mr-1 font-bold">
              {delegatedAccounts.length}
            </span>
            delegated account{delegatedAccounts.length > 1 ? 's' : ''}
          </div>
        ) : null}
      </div>

      <div className="items-center justify-center flex w-full gap-5">
        {isVoting && showVoteYes ? (
          <Button
            tooltipMessage="Vote yes with all the available voting power"
            className="w-1/2"
            onClick={() => handleShowVoteModal(YesNoVote.Yes)}
          >
            Vote Yes
          </Button>
        ) : null}

        {isVoting && showVoteNo ? (
          <Button
            tooltipMessage="Vote no with all the available voting power"
            className="w-1/2"
            onClick={() => handleShowVoteModal(YesNoVote.No)}
          >
            Vote No
          </Button>
        ) : null}

        {isVoting && showWithdraw ? (
          <Button
            tooltipMessage="Withdraw your vote(s)"
            className="w-1/2"
            onClick={() => submitRelinquishVotes()}
          >
            Withdraw
          </Button>
        ) : null}

        {!isVoting && showWithdraw ? (
          <Button
            tooltipMessage="Release your tokens"
            className="w-1/2"
            onClick={() => submitRelinquishVotes()}
          >
            Release
          </Button>
        ) : null}

        {isVoting && showSync ? (
          <Button
            tooltipMessage="Synchronize your voting power"
            className="w-1/2"
            onClick={() => submitSyncVotes()}
          >
            Sync
          </Button>
        ) : null}
      </div>

      {showVoteModal ? (
        <VoteCommentModal
          isOpen={showVoteModal}
          onClose={handleCloseShowVoteModal}
          vote={vote!}
          tokenOwnerRecordsToVoteWith={sortedAccounts.accountsReadyToVote.map(
            (account) => account.voterTokenRecord!,
          )}
        />
      ) : null}
    </div>
  );
};

export default VotePanel;
