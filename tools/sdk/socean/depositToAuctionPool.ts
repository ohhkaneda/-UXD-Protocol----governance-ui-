import { DescendingAuctionProgram } from './programs/descending-auction'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import socean from '@soceanfi/descending-auction'
import { EndpointTypes } from '@models/types'
import soceanConfiguration from './configuration'
import { BN } from '@project-serum/anchor'

export async function depositToAuctionPool({
  cluster,
  program,
  depositAmount,
  auction,
  authority,
  sourceAccount,
  saleMint,
}: {
  cluster: EndpointTypes
  program: DescendingAuctionProgram
  depositAmount: BN
  auction: PublicKey
  authority: PublicKey
  sourceAccount: PublicKey
  saleMint: PublicKey
}): Promise<TransactionInstruction> {
  const descendingAuctionProgramId =
    soceanConfiguration.descendingAuctionProgramId[cluster]

  if (!descendingAuctionProgramId) {
    throw new Error(
      'unsupported cluster to create depositToAuctionPool instruction'
    )
  }

  const [[auctionAuthority], [auctionPool]] = await Promise.all([
    socean.findAuctionAuthority(descendingAuctionProgramId, auction),
    socean.findAuctionPool(descendingAuctionProgramId, auction, saleMint),
  ])

  return program.instruction.depositToAuctionPool(depositAmount, {
    accounts: {
      auction,
      auctionPool,
      auctionAuthority,
      authority,
      sourceAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  })
}
