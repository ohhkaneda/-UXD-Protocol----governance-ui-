import * as yup from 'yup';
import Select from '@components/inputs/Select';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import {
  getDepositoryMintSymbols,
  getInsuranceMintSymbols,
} from '@tools/sdk/uxdProtocol/uxdClient';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDQuoteRedeemWithMangoDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectOptionList from '../../SelectOptionList';
import Input from '@components/inputs/Input';
import createQuoteRedeemWithMangoDepositoryInstruction from '@tools/sdk/uxdProtocol/createQuoteRedeemWithMangoDepositoryInstruction';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  collateralName: yup.string().required('Collateral Name address is required'),
  insuranceName: yup.string().required('Insurance Name address is required'),
  uiRedeemableAmount: yup
    .number()
    .moreThan(0, 'Redeemable amount should be more than 0')
    .required('Redeemable Amount is required'),
});

const UXDQuoteRedeemWithMangoDepository = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const { connection, form, formErrors, handleSetForm } =
    useInstructionFormBuilder<UXDQuoteRedeemWithMangoDepositoryForm>({
      index,
      initialFormValues: {
        governedAccount,
      },
      schema,

      buildInstruction: async function ({
        form,
        governedAccountPubkey,
        wallet,
      }) {
        return createQuoteRedeemWithMangoDepositoryInstruction({
          connection,
          uxdProgramId:
            form.governedAccount!.governance!.account.governedAccount,
          authority: governedAccountPubkey,
          depositoryMintName: form.collateralName!,
          insuranceMintName: form.insuranceName!,
          redeemableAmount: form.uiRedeemableAmount!,
          payer: wallet.publicKey!,
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
        label="Redeemable Amount"
        value={form.uiRedeemableAmount}
        type="number"
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiRedeemableAmount',
          })
        }
        error={formErrors['uiRedeemableAmount']}
      />
    </>
  );
};

export default UXDQuoteRedeemWithMangoDepository;
