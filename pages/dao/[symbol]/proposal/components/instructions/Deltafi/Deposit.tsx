import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import deltafiConfiguration, {
  DeltafiDexV2,
} from '@tools/sdk/deltafi/configuration';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { DeltafiPoolDepositForm } from '@utils/uiTypes/proposalCreationTypes';
import deposit from '@tools/sdk/deltafi/instructions/deposit';
import Input from '@components/inputs/Input';
import SelectDeltafiPool, { PoolName } from '@components/SelectDeltafiPool';
import { uiAmountToNativeBN } from '@tools/sdk/units';
import useDeltafiProgram from '@hooks/useDeltafiProgram';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  poolName: yup.string().required('Pool name is required'),
  uiBaseAmount: yup
    .number()
    .typeError('Base Amount has to be a number')
    .required('Base Amount is required'),
  uiQuoteAmount: yup
    .number()
    .typeError('Quote Amount has to be a number')
    .required('Quote Amount is required'),
  uiMinBaseShare: yup
    .number()
    .typeError('Min Base Share has to be a number')
    .required('Min Base Share is required'),
  uiMinQuoteShare: yup
    .number()
    .typeError('Min Quote Share has to be a number')
    .required('Min Quote Share is required'),
});

const DeltafiPoolDeposit = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const { poolInfoList } = DeltafiDexV2.configuration;

  const deltafiProgram = useDeltafiProgram();

  const {
    form,
    handleSetForm,
    formErrors,
  } = useInstructionFormBuilder<DeltafiPoolDepositForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({
      cluster,
      governedAccountPubkey,
      form,
    }) {
      if (cluster !== 'mainnet') {
        throw new Error('Other cluster than mainnet are not supported yet.');
      }

      if (!deltafiProgram) {
        throw new Error('Deltafi program not loaded yet');
      }

      const poolInfo = deltafiConfiguration.getPoolInfoByPoolName(
        form.poolName!,
      );

      if (!poolInfo) {
        throw new Error('Pool info is required');
      }

      const baseDecimals = deltafiConfiguration.getBaseOrQuoteMintDecimals(
        poolInfo.mintBase,
      );
      const quoteDecimals = deltafiConfiguration.getBaseOrQuoteMintDecimals(
        poolInfo.mintQuote,
      );

      return deposit({
        deltafiProgram,
        authority: governedAccountPubkey,
        poolInfo,
        baseAmount: uiAmountToNativeBN(form.uiBaseAmount!, baseDecimals),
        quoteAmount: uiAmountToNativeBN(form.uiQuoteAmount!, quoteDecimals),
        minBaseShare: uiAmountToNativeBN(form.uiMinBaseShare!, baseDecimals),
        minQuoteShare: uiAmountToNativeBN(form.uiMinQuoteShare!, quoteDecimals),
      });
    },
  });

  return (
    <>
      <SelectDeltafiPool
        title="Pool"
        poolInfoList={poolInfoList}
        selectedValue={form.poolName}
        onSelect={(poolName: PoolName) =>
          handleSetForm({
            value: poolName,
            propertyName: 'poolName',
          })
        }
      />

      <Input
        min={0}
        label="Base Amount"
        value={form.uiBaseAmount}
        type="number"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiBaseAmount',
          })
        }
        error={formErrors['uiBaseAmount']}
      />

      <Input
        min={0}
        label="Quote Amount"
        value={form.uiQuoteAmount}
        type="number"
        onChange={(evt) => {
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiQuoteAmount',
          });
        }}
        error={formErrors['uiQuoteAmount']}
      />

      <Input
        min={0}
        label="Min Base Share"
        value={form.uiMinBaseShare}
        type="number"
        onChange={(evt) => {
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiMinBaseShare',
          });
        }}
        error={formErrors['uiMinBaseShare']}
      />

      <Input
        min={0}
        label="Min Quote Share"
        value={form.uiMinQuoteShare}
        type="number"
        onChange={(evt) => {
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiMinQuoteShare',
          });
        }}
        error={formErrors['uiMinQuoteShare']}
      />
    </>
  );
};

export default DeltafiPoolDeposit;
