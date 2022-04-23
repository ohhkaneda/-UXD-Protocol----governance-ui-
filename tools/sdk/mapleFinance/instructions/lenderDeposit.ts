import { SYSTEM_PROGRAM_ID } from '@solana/spl-governance';
import { TOKEN_PROGRAM_ID, u64 } from '@solana/spl-token';
import {
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';

import { MapleFinancePrograms, MapleFinance, PoolName } from '../configuration';

export async function lenderDeposit({
  poolName,
  authority,
  programs,
  depositAmount,
}: {
  poolName: PoolName;
  authority: PublicKey;
  programs: MapleFinancePrograms;
  depositAmount: u64;
}): Promise<TransactionInstruction> {
  const {
    lender,
    pool,
    globals,
    baseMint,
    poolLocker,
    sharesMint,
    lockedShares,
    lenderShares,
    lenderLocker,
  } = MapleFinance.pools[poolName];

  console.log('Lender Deposit', {
    depositAmount: depositAmount.toString(),
    lender: lender.toBase58(),
    lenderUser: authority.toBase58(),
    pool: pool.toBase58(),
    globals: globals.toBase58(),
    baseMint: baseMint.mint.toBase58(),
    poolLocker: poolLocker.toBase58(),
    sharesMint: sharesMint.toBase58(),
    lockedShares: lockedShares.toBase58(),
    lenderShares: lenderShares.toBase58(),
    lenderLocker: lenderLocker.toBase58(),
    systemProgram: SYSTEM_PROGRAM_ID.toBase58(),
    tokenProgram: TOKEN_PROGRAM_ID.toBase58(),
    rent: SYSVAR_RENT_PUBKEY.toBase58(),
  });

  return programs.Syrup.instruction.lenderDeposit(depositAmount, {
    accounts: {
      lender,
      lenderUser: authority,
      pool,
      globals,
      baseMint: baseMint.mint,
      poolLocker,
      sharesMint,
      lockedShares,
      lenderShares,
      lenderLocker,
      systemProgram: SYSTEM_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    },
  });
}

export default lenderDeposit;
