import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import {
  getDepositoryMintSymbols,
  getInsuranceMintSymbols,
} from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDRedeemFromMangoDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';
import { PublicKey } from '@solana/web3.js';
import Input from '@components/inputs/Input';
import createRedeemWithMangoDepositoryInstruction from '@tools/sdk/uxdProtocol/createRedeemFromMangoDepositoryInstruction';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  collateralName: yup.string().required('Valid Collateral name is required'),
  insuranceName: yup.string().required('Valid Insurance name is required'),
  uiAmountRedeemable: yup.number().required('Amount to Redeem is required'),
  slippage: yup.number().required('Slippage is required'),
});

const RedeemFromMangoDepository = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    connection,
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDRedeemFromMangoDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    shouldSplitIntoSeparateTxs: true,
    buildInstruction: async function ({ form, wallet, governedAccountPubkey }) {
      return createRedeemWithMangoDepositoryInstruction({
        connection,
        // form.governedAccount!.governance!.account.governedAccount,
        uxdProgramId: new PublicKey(
          'UXD8m9cvwk4RcSxnX2HZ9VudQCEeDH6fRnB4CAP57Dr',
        ),
        uiAmountRedeemable: form.uiAmountRedeemable!,
        slippage: form.slippage!,
        authority: governedAccountPubkey,
        payer: wallet.publicKey!,
        depositoryMintName: form.collateralName!,
        insuranceMintName: form.insuranceName!,
      });
    },
  });

  return (
    <>
      <Select
        label="Collateral Name"
        value={form.collateralName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'collateralName' })
        }
        error={formErrors['collateralName']}
      >
        <SelectOptionList list={getDepositoryMintSymbols(connection.cluster)} />
      </Select>

      <Select
        label="Insurance Name"
        value={form.insuranceName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'insuranceName' })
        }
        error={formErrors['insuranceName']}
      >
        <SelectOptionList list={getInsuranceMintSymbols(connection.cluster)} />
      </Select>

      <Input
        label="Amount to Redeem"
        value={form.uiAmountRedeemable}
        type="number"
        min={1}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiAmountRedeemable',
          })
        }
        error={formErrors['uiAmountRedeemable']}
      />

      <Input
        label="Slippage (1 = 0.1%, 10 = 1%, 100 = 10% etc.)"
        value={form.slippage}
        type="number"
        min={1}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'slippage',
          })
        }
        error={formErrors['slippage']}
      />
    </>
  );
};

export default RedeemFromMangoDepository;
