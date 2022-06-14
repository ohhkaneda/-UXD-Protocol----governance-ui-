import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { DeltafiProgram } from '../program/deltafi';
import deltafiConfiguration, { PoolInfo } from '../configuration';

export default async function createLiquidityProvider({
  deltafiProgram,
  authority,
  poolInfo,
}: {
  deltafiProgram: DeltafiProgram;
  authority: PublicKey;
  poolInfo: PoolInfo;
}) {
  const [{ configKey }, [lpPublicKey, lpBump]] = await Promise.all([
    deltafiProgram.account.swapInfo.fetch(poolInfo.swapInfo),

    deltafiConfiguration.findLiquidityProviderAddress({
      poolInfo,
      authority,
    }),
  ]);

  console.log('CreateLiquidityProvider', {
    lpBump,
    marketConfig: configKey.toBase58(),
    swapInfo: poolInfo.swapInfo.toBase58(),
    liquidityProvider: lpPublicKey.toBase58(),
    owner: authority.toBase58(),
    systemProgram: SystemProgram.programId.toBase58(),
    rent: SYSVAR_RENT_PUBKEY.toBase58(),
  });

  return deltafiProgram.instruction.createLiquidityProvider(lpBump, {
    accounts: {
      marketConfig: configKey,
      swapInfo: poolInfo.swapInfo,
      liquidityProvider: lpPublicKey,
      owner: authority,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    },
  });
}
