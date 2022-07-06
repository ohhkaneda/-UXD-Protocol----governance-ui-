import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import deltafiConfiguration, {
  DeltafiDexV2,
} from '@tools/sdk/deltafi/configuration';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { DeltafiCreateLiquidityProviderForm } from '@utils/uiTypes/proposalCreationTypes';
import SelectDeltafiPool, { PoolName } from '@components/SelectDeltafiPool';
import createLiquidityProviderV2 from '@tools/sdk/deltafi/instructions/createLiquidityProviderV2';
import useDeltafiProgram from '@hooks/useDeltafiProgram';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  poolName: yup.string().required('Pool name is required'),
});

const DeltafiCreateLiquidityProvider = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const { poolInfoList } = DeltafiDexV2.configuration;

  const deltafiProgram = useDeltafiProgram();

  const { form, handleSetForm } =
    useInstructionFormBuilder<DeltafiCreateLiquidityProviderForm>({
      index,
      initialFormValues: {
        governedAccount,
      },
      schema,
      buildInstruction: async function ({
        wallet,
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

        return createLiquidityProviderV2({
          deltafiProgram,
          authority: governedAccountPubkey,
          poolInfo,
          payer: wallet.publicKey!,
        });
      },
    });

  return (
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
  );
};

export default DeltafiCreateLiquidityProvider;
