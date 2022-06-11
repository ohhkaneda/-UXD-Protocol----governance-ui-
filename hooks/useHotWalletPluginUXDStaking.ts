import { useCallback, useEffect, useState } from 'react';
import { HotWalletAccount } from './useHotWallet';
import uxdProtocolStakingConfiguration from '@tools/sdk/uxdProtocolStaking/configuration';
import useWalletStore from 'stores/useWalletStore';
import { PublicKey } from '@solana/web3.js';
import {
  SingleSideStakingClient,
  SolanaAugmentedProvider,
  SolanaProvider,
  StakingCampaign,
  getTokenAccountUiBalance,
} from '@uxdprotocol/uxd-staking-client';
import { Wallet } from '@marinade.finance/marinade-ts-sdk';
import { nativeAmountToFormattedUiAmount } from '@tools/sdk/units';

const UsersCampaigns = {
  ['AWuSjBCEMVtk8fX2HAwtuMjoHLmLM72PJxi1dZdKHPFu']: [
    // Fake Dao devnet SOL Treasury's governance
    {
      name: 'Campaign Name',
      pda: new PublicKey('CrRH3o9TbxvRdNkkjcmG5qdG7XM397nKcRmxgkVniAtB'),
    },
  ],

  ['AuQHcJZhTd1dnXRrM78RomFiCvW6a9CqxxJ94Fp9h8b']: [
    // Fake Dao SOL Treasury's governance
    {
      name: 'Campaign Test',
      pda: new PublicKey('C37FJ2JeDciaEs1nKazMkkH21VZjQVq4WTMLSJYiibRr'),
    },
  ],

  ['7M6TSEkRiXiYmpRCcCDSdJGTGxAPem2HBqjW4gLQ2KoE']: [
    // Dao SOL Treasury's governance
    {
      name: 'UXP Campaign',
      pda: new PublicKey('GMkG1Xr1ZAtLbHRxfbqLFEHqjP7rGwEfhQFed41aEL1k'),
    },
  ],
};

export type StakingCampaignInfo = StakingCampaign & {
  name: string;
  pda: PublicKey;

  // Token staked on staking accounts v1
  uiStakedTokensV1: number;
  uiStakedTokensV2: number;
};

const useHotWalletPluginUXDStaking = (hotWalletAccount: HotWalletAccount) => {
  const [stakingCampaignsInfo, setStakingCampaignsInfo] = useState<
    StakingCampaignInfo[]
  >();
  const connection = useWalletStore((s) => s.connection);

  const loadUXDStakingCampaignInfo = useCallback(async () => {
    try {
      const programId =
        uxdProtocolStakingConfiguration.programId[connection.cluster];

      if (!programId) {
        throw new Error(
          `Unsupported cluster ${connection.cluster} for UXD Protocol Staking`,
        );
      }

      const sssClient = SingleSideStakingClient.load({
        provider: new SolanaAugmentedProvider(
          SolanaProvider.init({
            connection: connection.current,

            // Wallet is not used in the underlying client
            wallet: (null as unknown) as Wallet,
          }),
        ),
        programId,
      });

      const campaigns =
        UsersCampaigns[hotWalletAccount.publicKey.toBase58()] ?? [];

      const stakingCampaigns: StakingCampaign[] = await Promise.all(
        campaigns.map(({ pda }) => sssClient.getOnChainStakingCampaign(pda)),
      );

      const uiStakedTokensStakingAccountsV1: PromiseSettledResult<number>[] = await Promise.allSettled(
        stakingCampaigns.map(({ stakedVault }) =>
          getTokenAccountUiBalance({
            connection: connection.current,
            tokenAccount: stakedVault,
          }),
        ),
      );

      setStakingCampaignsInfo(
        stakingCampaigns.map((stakingCampaign, index) => {
          const uiStakedTokensV1 = uiStakedTokensStakingAccountsV1[index];

          return {
            ...stakingCampaign,
            uiStakedTokensV1:
              uiStakedTokensV1.status === 'rejected'
                ? 0
                : uiStakedTokensV1.value,
            uiStakedTokensV2: Number(
              nativeAmountToFormattedUiAmount(
                stakingCampaign.stakedAmount,
                stakingCampaign.stakedMintDecimals,
              ),
            ),
            name: campaigns[index].name,
            pda: campaigns[index].pda,
          };
        }),
      );
    } catch (e) {
      console.log(e);
      setStakingCampaignsInfo([]);
    }
  }, [connection, hotWalletAccount]);

  useEffect(() => {
    loadUXDStakingCampaignInfo();
  }, [loadUXDStakingCampaignInfo]);

  return { stakingCampaignsInfo };
};

export default useHotWalletPluginUXDStaking;
