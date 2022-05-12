/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { withFinalizeVote, YesNoVote } from '@solana/spl-governance';
import { TransactionInstruction } from '@solana/web3.js';
import { useCallback, useState } from 'react';
import { relinquishVote } from '../actions/relinquishVote';
import { useHasVoteTimeExpired } from '../hooks/useHasVoteTimeExpired';
import useRealm from '../hooks/useRealm';
import { RpcContext } from '@solana/spl-governance';
import { GoverningTokenType } from '@solana/spl-governance';

import useWalletStore, {
  EnhancedProposalState,
} from '../stores/useWalletStore';
import Button, { SecondaryButton } from './Button';
import VoteCommentModal from './VoteCommentModal';
import { getProgramVersionForRealm } from '@models/registry/api';
import { VoterWeight } from '@models/voteWeights';
import { BN } from '@project-serum/anchor';

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
    realm,
    realmInfo,
    ownVoterWeight,
  } = useRealm();
  const wallet = useWalletStore((s) => s.current);
  const connection = useWalletStore((s) => s.connection);
  const connected = useWalletStore((s) => s.connected);
  const fetchRealm = useWalletStore((s) => s.actions.fetchRealm);
  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!);

  // ---- Here we get the ownTokenRecord of the StakingAccount behind the account 3LAM8JJJBcb4EpGJ6ja7jdUXBpSxyY477x5wc1rX6zKT (burner wallet)
  const { tokenRecords } = useWalletStore((s) => s.selectedRealm);

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

  const delegatedAccounts = getDelegatedAccounts();

  let tokenRecord = ownTokenRecord;
  let voterWeight = ownVoterWeight;
  let voteRecord =
    wallet?.publicKey && voteRecordsByVoter[wallet.publicKey.toBase58()];

  // If there is at least one delegated account vote with it (for now)
  // @TODO we should vote with the regular account + every delegated accounts one after another (and if there are tokens to vote with)
  if (delegatedAccounts.length) {
    tokenRecord = tokenRecords[delegatedAccounts[0].address];
    voterWeight = new VoterWeight(tokenRecord, ownCouncilTokenRecord);
    voteRecord = voteRecordsByVoter[delegatedAccounts[0].address];
  }
  // ------

  // ---- Here gotta use the tokenRecord of the StakingAccount because the tokens are owned by the staking account directly
  const voterTokenRecord =
    tokenType === GoverningTokenType.Community
      ? tokenRecord
      : ownCouncilTokenRecord;

  const isVoteCast = voteRecord !== undefined;
  const isVoting =
    proposal?.account.state === EnhancedProposalState.Voting &&
    !hasVoteTimeExpired;

  const isVoteEnabled =
    connected &&
    isVoting &&
    !isVoteCast &&
    voterTokenRecord &&
    voterWeight.hasMinAmountToVote(voterTokenRecord.account.governingTokenMint);

  const isWithdrawEnabled =
    connected &&
    voteRecord &&
    !voteRecord?.account.isRelinquished &&
    proposal &&
    (proposal!.account.state === EnhancedProposalState.Voting ||
      proposal!.account.state === EnhancedProposalState.Completed ||
      proposal!.account.state === EnhancedProposalState.Cancelled ||
      proposal!.account.state === EnhancedProposalState.Succeeded ||
      proposal!.account.state === EnhancedProposalState.Outdated ||
      proposal!.account.state === EnhancedProposalState.Executing ||
      proposal!.account.state === EnhancedProposalState.Defeated);

  const submitRelinquishVote = async () => {
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
        console.log('>>>> withFinalizeVote');
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

      await relinquishVote(
        rpcContext,
        proposal!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        voterTokenRecord!.pubkey,
        voteRecord!.pubkey,
        instructions,
      );
    } catch (ex) {
      console.error("Can't relinquish vote", ex);
    }

    await fetchRealm(programId, realmId);
  };

  const handleShowVoteModal = (vote: YesNoVote) => {
    setVote(vote);
    setShowVoteModal(true);
  };

  const handleCloseShowVoteModal = useCallback(() => {
    setShowVoteModal(false);
  }, []);

  const actionLabel =
    !isVoteCast || !connected
      ? 'Cast your vote'
      : isVoting
      ? 'Withdraw your vote'
      : 'Release your tokens';

  const withdrawTooltipContent = !connected
    ? 'You need to connect your wallet'
    : !isWithdrawEnabled
    ? !voteRecord?.account.isRelinquished
      ? 'Owner vote record is not relinquished'
      : 'The proposal is not in a valid state to execute this action.'
    : '';

  const voteTooltipContent = !connected
    ? 'You need to connect your wallet to be able to vote'
    : !isVoting && isVoteCast
    ? 'Proposal is not in a voting state anymore.'
    : !voterTokenRecord ||
      !voterWeight.hasMinAmountToVote(
        voterTokenRecord.account.governingTokenMint,
      )
    ? 'You don’t have governance power to vote in this realm'
    : '';

  const notVisibleStatesForNotConnectedWallet = [
    EnhancedProposalState.Cancelled,
    EnhancedProposalState.Succeeded,
    EnhancedProposalState.Draft,
    EnhancedProposalState.Completed,
  ];

  const isVisibleToWallet = !connected
    ? !hasVoteTimeExpired &&
      typeof notVisibleStatesForNotConnectedWallet.find(
        (x) => x === proposal?.account.state,
      ) === 'undefined'
    : !voteRecord?.account.isRelinquished;

  const isPanelVisible = (isVoting || isVoteCast) && isVisibleToWallet;
  return (
    <>
      {isPanelVisible && (
        <div className="bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4">
          <h3 className="mb-4 text-center">{actionLabel}</h3>

          <div className="items-center justify-center flex w-full gap-5">
            {isVoteCast && connected ? (
              <SecondaryButton
                small
                tooltipMessage={withdrawTooltipContent}
                onClick={() => submitRelinquishVote()}
                disabled={!isWithdrawEnabled}
              >
                {isVoting ? 'Withdraw' : 'Release Tokens'}
              </SecondaryButton>
            ) : (
              <div className="flex flex-col">
                {delegatedAccounts.length && (
                  <div className="text-xs mb-4">
                    Delegate of{' '}
                    <span className="ml-1 mr-1 font-bold">
                      {delegatedAccounts.length}
                    </span>{' '}
                    account{delegatedAccounts.length > 1 ? 's' : ''} for total a
                    vote power of
                    <span className="ml-1 mr-1 font-bold">
                      {delegatedAccounts.reduce(
                        (total, oneDelegatedAccountInfo) =>
                          total + oneDelegatedAccountInfo.nbToken,
                        0,
                      )}
                    </span>
                    tokens
                  </div>
                )}

                {isVoting && (
                  <div className="w-full flex justify-between items-center gap-5">
                    <Button
                      tooltipMessage={voteTooltipContent}
                      className="w-1/2"
                      onClick={() => handleShowVoteModal(YesNoVote.Yes)}
                      disabled={!isVoteEnabled}
                    >
                      Vote Yes
                    </Button>

                    <Button
                      tooltipMessage={voteTooltipContent}
                      className="w-1/2"
                      onClick={() => handleShowVoteModal(YesNoVote.No)}
                      disabled={!isVoteEnabled}
                    >
                      Vote No
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {showVoteModal ? (
            <VoteCommentModal
              isOpen={showVoteModal}
              onClose={handleCloseShowVoteModal}
              vote={vote!}
              voterTokenRecord={voterTokenRecord!}
            />
          ) : null}
        </div>
      )}
    </>
  );
};

export default VotePanel;
