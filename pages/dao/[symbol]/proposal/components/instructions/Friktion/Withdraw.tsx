import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { FriktionWithdrawForm } from '@utils/uiTypes/proposalCreationTypes';
import useGovernanceUnderlyingTokenAccounts from '@hooks/useGovernanceUnderlyingTokenAccounts';
import { VoltList, getVolts } from '@tools/sdk/friktion/friktion';
import { useState, useEffect } from 'react';
import Input from '@components/inputs/Input';
import Select from '@components/inputs/Select';
import { PublicKey } from '@solana/web3.js';
import SelectOptionList from '../../SelectOptionList';
import TokenAccountSelect from '../../TokenAccountSelect';
import withdrawFromVault from '@tools/sdk/friktion/instructions/withdrawFromVault';
import { uiAmountToNativeBN } from '@tools/sdk/units';

const schema = yup.object().shape({
  governedAccount: yup.object().required('Governance is required'),
  receiverAccount: yup.string().typeError('Source account is required'),
  volt: yup.string().required('Volt is required'),
  uiAmount: yup.number().typeError('Amount is required'),
});

const Withdraw = ({
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
  } = useInstructionFormBuilder<FriktionWithdrawForm>({
    index,
    initialFormValues: {
      governedAccount,
      uiAmount: 0,
    },
    schema,
    buildInstruction: async function ({
      form,
      connection,
      wallet,
      governedAccountPubkey,
    }) {
      if (!friktionVolts || !friktionVolts[form.volt!]) {
        throw new Error('Could not load Friktion Volt');
      }

      const volt = friktionVolts[form.volt!];
      return withdrawFromVault({
        connection,
        wallet,
        voltVaultId: volt.voltVaultId,
        governancePubkey: governedAccountPubkey,
        amount: uiAmountToNativeBN(
          form.uiAmount!.toString(),
          volt.shareTokenDecimals,
        ),
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
                label="Receiver Account"
                value={form.receiverAccount?.toString()}
                filterByMint={
                  friktionVolts[form.volt]
                    ? [new PublicKey(friktionVolts[form.volt].depositTokenMint)]
                    : undefined
                }
                onChange={(value) =>
                  handleSetForm({ value, propertyName: 'receiverAccount' })
                }
                error={formErrors['receiverAccount']}
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

export default Withdraw;
