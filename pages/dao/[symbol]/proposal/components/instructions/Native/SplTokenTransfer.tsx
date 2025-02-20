import React, { useContext, useEffect, useState } from 'react';
import Input from '@components/inputs/Input';
import useRealm from '@hooks/useRealm';
import { AccountInfo } from '@solana/spl-token';
import { getMintMinAmountAsDecimal } from '@tools/sdk/units';
import { PublicKey } from '@solana/web3.js';
import { precision } from '@utils/formatting';
import { tryParseKey } from '@tools/validators/pubkey';
import useWalletStore from 'stores/useWalletStore';
import { TokenProgramAccount, tryGetTokenAccount } from '@utils/tokens';
import {
  SplTokenTransferForm,
  FormInstructionData,
} from '@utils/uiTypes/proposalCreationTypes';
import { getAccountName } from '@components/instructions/tools';
import { debounce } from '@utils/debounce';
import { getTokenTransferSchema } from '@utils/validations';
import useGovernanceAssets from '@hooks/useGovernanceAssets';
import { Governance } from '@solana/spl-governance';
import { ProgramAccount } from '@solana/spl-governance';
import {
  getSolTransferInstruction,
  getTransferInstruction,
} from '@utils/instructionTools';
import { NewProposalContext } from '../../../new';
import GovernedAccountSelect from '../../GovernedAccountSelect';

const SplTokenTransfer = ({
  index,
  governance,
}: {
  index: number;
  governance: ProgramAccount<Governance> | null;
}) => {
  const connection = useWalletStore((s) => s.connection);
  const wallet = useWalletStore((s) => s.current);
  const { realmInfo } = useRealm();
  const { governedTokenAccountsWithoutNfts } = useGovernanceAssets();
  const shouldBeGoverned = index !== 0 && governance;
  const programId: PublicKey | undefined = realmInfo?.programId;
  const [form, setForm] = useState<SplTokenTransferForm>({
    programId: programId?.toString(),
  });
  const [governedAccount, setGovernedAccount] = useState<
    ProgramAccount<Governance> | undefined
  >(undefined);
  const [
    destinationAccount,
    setDestinationAccount,
  ] = useState<TokenProgramAccount<AccountInfo> | null>(null);
  const [formErrors, setFormErrors] = useState({});
  const mintMinAmount = form.mintInfo
    ? getMintMinAmountAsDecimal(form.mintInfo)
    : 1;
  const currentPrecision = precision(mintMinAmount);
  const { handleSetInstruction } = useContext(NewProposalContext);
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({});
    setForm({ ...form, [propertyName]: value });
  };
  const setMintInfo = (value) => {
    setForm({ ...form, mintInfo: value });
  };
  const setAmount = (event) => {
    const value = event.target.value;
    handleSetForm({
      value: value,
      propertyName: 'amount',
    });
  };
  const validateAmountOnBlur = () => {
    const value = form.amount;

    handleSetForm({
      value: parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value)),
        ).toFixed(currentPrecision),
      ),
      propertyName: 'amount',
    });
  };
  async function getInstruction(): Promise<FormInstructionData> {
    return !form.governedTokenAccount?.isSol
      ? getTransferInstruction({
          schema,
          form,
          programId,
          connection,
          wallet,
          currentAccount: form.governedTokenAccount || null,
          setFormErrors,
        })
      : getSolTransferInstruction({
          schema,
          form,
          programId,
          connection,
          wallet,
          currentAccount: form.governedTokenAccount || null,
          setFormErrors,
        });
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    });
  }, [realmInfo?.programId]);
  useEffect(() => {
    if (form.destinationAccount) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.destinationAccount!);
        if (pubKey) {
          const account = await tryGetTokenAccount(connection.current, pubKey);
          setDestinationAccount(account ? account : null);
        } else {
          setDestinationAccount(null);
        }
      });
    } else {
      setDestinationAccount(null);
    }
  }, [form.destinationAccount]);
  useEffect(() => {
    handleSetInstruction(
      { governedAccount: governedAccount, getInstruction },
      index,
    );
  }, [form]);

  useEffect(() => {
    setGovernedAccount(form.governedTokenAccount?.governance);
    setMintInfo(form.governedTokenAccount?.mint?.account);
  }, [form.governedTokenAccount]);
  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address);
  const schema = getTokenTransferSchema({ form, connection });

  return (
    <>
      <GovernedAccountSelect
        label="Source account"
        governedAccounts={governedTokenAccountsWithoutNfts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedTokenAccount' });
        }}
        value={form.governedTokenAccount}
        error={formErrors['governedTokenAccount']}
        shouldBeGoverned={!!shouldBeGoverned}
        governance={governance}
      />

      <Input
        label="Destination account"
        value={form.destinationAccount}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'destinationAccount',
          })
        }
        error={formErrors['destinationAccount']}
      />
      {destinationAccount && (
        <div>
          <div className="pb-0.5 text-fgd-3 text-xs">Account owner</div>
          <div className="text-xs">
            {destinationAccount.account.owner.toString()}
          </div>
        </div>
      )}
      {destinationAccountName && (
        <div>
          <div className="pb-0.5 text-fgd-3 text-xs">Account name</div>
          <div className="text-xs">{destinationAccountName}</div>
        </div>
      )}
      <Input
        min={mintMinAmount}
        label="Amount"
        value={form.amount}
        type="number"
        onChange={setAmount}
        step={mintMinAmount}
        error={formErrors['amount']}
        onBlur={validateAmountOnBlur}
      />
    </>
  );
};

export default SplTokenTransfer;
