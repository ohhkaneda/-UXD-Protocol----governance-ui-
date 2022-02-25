import {
  createHoldingPDA,
  createVestingPDA,
  findHoldingPDA,
  findVaultPDA,
  findVestingPDA,
} from '@soceanfi/bonding'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { BondingProgram } from './programs'
import soceanConfiguration from './configuration'
import { EndpointTypes } from '@models/types'

const INDEX_MAGIC_NUMBER = 0

export async function cancelVest({
  cluster,
  program,
  authority,
  bondPool,
  bondedMint,
  userBondedAccount,
  userTargetAccount,
}: {
  cluster: EndpointTypes
  program: BondingProgram
  authority: PublicKey
  bondPool: PublicKey
  bondedMint: PublicKey
  userBondedAccount: PublicKey
  userTargetAccount: PublicKey
}): Promise<TransactionInstruction> {
  const bondingProgramId = soceanConfiguration.bondingProgramId[cluster]

  if (!bondingProgramId) {
    throw new Error(
      'unsupported cluster to create mintBondedTokens instruction'
    )
  }

  const [[vault], [vesting, bumpVesting]] = await Promise.all([
    findVaultPDA(bondingProgramId, bondPool),
    findVestingPDA(bondingProgramId, bondPool, authority, INDEX_MAGIC_NUMBER),
  ])

  await createVestingPDA(bondingProgramId, bondPool, authority, 0, bumpVesting)

  const [holding, bumpHolding] = await findHoldingPDA(bondingProgramId, vesting)

  await createHoldingPDA(bondingProgramId, vesting, bumpHolding)

  console.log('Cancel vest', {
    vault: vault.toString(),
    vesting: vesting.toString(),
    user: authority.toString(),
    userBondedAccount: userBondedAccount.toString(),
    userTargetAccount: userTargetAccount.toString(),
    bondPool: bondPool.toString(),
    bondedMint: bondedMint.toString(),
    holding: holding.toString(),
  })

  return program.instruction.cancelVest({
    accounts: {
      user: authority,
      userBondedAccount,
      userTargetAccount,
      vesting,
      bondPool,
      bondedMint,
      holding,
      vault,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  })
}
