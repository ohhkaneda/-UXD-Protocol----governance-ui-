import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import deltafiConfiguration, {
  DeltafiDexV2,
} from '@tools/sdk/deltafi/configuration';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { DeltafiPoolWithdrawForm } from '@utils/uiTypes/proposalCreationTypes';
import Input from '@components/inputs/Input';
import SelectDeltafiPool, { PoolName } from '@components/SelectDeltafiPool';
import { uiAmountToNativeBN } from '@tools/sdk/units';
import withdraw from '@tools/sdk/deltafi/instructions/withdraw';

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
});

const DeltafiPoolWithdraw = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const { poolInfoList, tokenInfoList } = DeltafiDexV2.configuration[
    'mainnet-prod'
  ];

  const {
    form,
    handleSetForm,
    formErrors,
  } = useInstructionFormBuilder<DeltafiPoolWithdrawForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    buildInstruction: async function ({
      connection,
      wallet,
      cluster,
      governedAccountPubkey,
      form,
    }) {
      if (cluster !== 'mainnet') {
        throw new Error('Other cluster than mainnet are not supported yet.');
      }

      const deltafiProgram = deltafiConfiguration.getDeltafiProgram({
        connection,
        wallet,
      });

      // We consider that the configuration must have token info about tokens used in pools
      // thus the use of !
      const poolInfo = poolInfoList.find(({ name }) => name === form.poolName!);

      if (!poolInfo) {
        throw new Error('Pool info is required');
      }

      const { decimals: baseDecimals } = tokenInfoList.find((token) =>
        token.mint.equals(poolInfo.mintBase),
      )!;

      const { decimals: quoteDecimals } = tokenInfoList.find((token) =>
        token.mint.equals(poolInfo.mintQuote),
      )!;

      return withdraw({
        deltafiProgram,
        authority: governedAccountPubkey,
        poolInfo,
        baseAmount: uiAmountToNativeBN(form.uiBaseAmount!, baseDecimals),
        quoteAmount: uiAmountToNativeBN(form.uiQuoteAmount!, quoteDecimals),
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
    </>
  );
};

export default DeltafiPoolWithdraw;
