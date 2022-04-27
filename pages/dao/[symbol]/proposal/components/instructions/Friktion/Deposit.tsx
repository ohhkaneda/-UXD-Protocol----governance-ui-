import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import Input from '@components/inputs/Input';
import { PublicKey } from '@solana/web3.js';
import TokenAccountSelect from '../../TokenAccountSelect';
import { FriktionDepositForm } from '@utils/uiTypes/proposalCreationTypes';
import Select from '@components/inputs/Select';
import useGovernanceUnderlyingTokenAccounts from '@hooks/useGovernanceUnderlyingTokenAccounts';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { getVolts, VoltList } from '@tools/sdk/friktion/friktion';
import SelectOptionList from '../../SelectOptionList';
import depositToVolt from '@tools/sdk/friktion/instructions/depositToVault';

const schema = yup.object().shape({
  governedAccount: yup.object().required('Governance is required'),
  sourceAccount: yup.string().typeError('Source account is required'),
  volt: yup.string().required('Volt is required'),
  uiAmount: yup.number().typeError('Amount is required'),
});

const FriktionDeposit = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    form,
    formErrors,
    handleSetForm,
    governedAccountPubkey,
  } = useInstructionFormBuilder<FriktionDepositForm>({
    index,
    initialFormValues: {
      governedAccount,
      uiAmount: 0,
    },
    schema,
    buildInstruction: async function ({
      form,
      governedAccountPubkey,
      connection,
      wallet,
    }) {
      if (!friktionVolts || !friktionVolts[form.volt!]) {
        throw new Error('Could not load Friktion Volt');
      }

      const volt = friktionVolts[form.volt!];
      return depositToVolt({
        connection,
        wallet,
        voltVaultId: volt.voltVaultId,
        governancePubkey: governedAccountPubkey,
        sourceTokenAccount: new PublicKey(form.sourceAccount!),
        amount: form.uiAmount!,
        decimals: volt.shareTokenDecimals,
      });
    },
  });

  const [friktionVolts, setFriktionVolts] = useState<VoltList | null>(null);

  const { ownedTokenAccountsInfo } = useGovernanceUnderlyingTokenAccounts(
    governedAccountPubkey ?? undefined,
  );

  useEffect(() => {
    // call for the mainnet friktion volts
    if (!governedAccount) return;
    (async () => {
      const volts = await getVolts();
      setFriktionVolts(volts);
    })();
  }, [JSON.stringify(governedAccount)]);

  return (
    <>
      {ownedTokenAccountsInfo && friktionVolts && (
        <>
          <Select
            label="Friktion Volt"
            value={form.volt}
            placeholder="Please select..."
            onChange={(value) => {
              handleSetForm({
                propertyName: 'volt',
                value,
              });
            }}
            error={formErrors['voltVaultId']}
          >
            <SelectOptionList list={Object.keys(friktionVolts)} />
          </Select>
          {form.volt && friktionVolts[form.volt] && (
            <>
              <TokenAccountSelect
                label="Source Account"
                value={form.sourceAccount?.toString()}
                filterByMint={
                  friktionVolts[form.volt]
                    ? [new PublicKey(friktionVolts[form.volt].depositTokenMint)]
                    : undefined
                }
                onChange={(value) =>
                  handleSetForm({ value, propertyName: 'sourceAccount' })
                }
                error={formErrors['sourceAccount']}
                ownedTokenAccountsInfo={ownedTokenAccountsInfo}
              />

              <Input
                min={0}
                label="Amount"
                value={form.uiAmount}
                type="number"
                onChange={(evt) => {
                  handleSetForm({
                    value: evt.target.value,
                    propertyName: 'uiAmount',
                  });
                }}
                error={formErrors['uiAmount']}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default FriktionDeposit;
