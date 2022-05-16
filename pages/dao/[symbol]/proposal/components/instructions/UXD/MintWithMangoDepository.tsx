import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import {
  getDepositoryMintSymbols,
  getInsuranceMintSymbols,
} from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDMintWithMangoDepository } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';
import createMintWithMangoDepositoryInstruction from '@tools/sdk/uxdProtocol/createMintFromMangoDepositoryInstruction';
import { PublicKey } from '@solana/web3.js';
import Input from '@components/inputs/Input';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  collateralName: yup.string().required('Valid Collateral name is required'),
  insuranceName: yup.string().required('Valid Insurance name is required'),
  uiCollateralAmount: yup
    .number()
    .required('Collateral Amount to Deposit is required'),
  slippage: yup.number().required('Slippage is required'),
});

const MintWithMangoDepository = ({
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
  } = useInstructionFormBuilder<UXDMintWithMangoDepository>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({ form, wallet, governedAccountPubkey }) {
      return createMintWithMangoDepositoryInstruction({
        connection,
        // form.governedAccount!.governance!.account.governedAccount,
        uxdProgramId: new PublicKey(
          'UXD8m9cvwk4RcSxnX2HZ9VudQCEeDH6fRnB4CAP57Dr',
        ),
        uiCollateralAmount: form.uiCollateralAmount!,
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
        label="Collateral Amount to Deposit"
        value={form.uiCollateralAmount}
        type="number"
        min={1}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiCollateralAmount',
          })
        }
        error={formErrors['uiCollateralAmount']}
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

export default MintWithMangoDepository;
