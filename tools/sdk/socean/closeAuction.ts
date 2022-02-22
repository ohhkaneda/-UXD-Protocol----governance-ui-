import { DescendingAuctionProgram } from './programs/descending-auction'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import socean from '@soceanfi/descending-auction'
import { EndpointTypes } from '@models/types'
import soceanConfiguration from './configuration'

export async function closeAuction({
  cluster,
  program,
  auction,
  authority,
  saleMint,
  destinationAccount,
}: {
  cluster: EndpointTypes
  program: DescendingAuctionProgram
  auction: PublicKey
  authority: PublicKey
  saleMint: PublicKey
  destinationAccount: PublicKey
}): Promise<TransactionInstruction> {
  const descendingAuctionProgramId =
    soceanConfiguration.descendingAuctionProgramId[cluster]

  if (!descendingAuctionProgramId) {
    throw new Error('unsupported cluster to create closeAuction instruction')
  }

  const [[auctionAuthority], [auctionPool]] = await Promise.all([
    socean.findAuctionAuthority(descendingAuctionProgramId, auction),
    socean.findAuctionPool(descendingAuctionProgramId, auction, saleMint),
  ])

  return program.instruction.closeAuction({
    accounts: {
      auction,
      auctionPool,
      auctionAuthority,
      authority,
      destinationAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  })
}
