import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { createAssociatedTokenAccount } from '@utils/associated'
import { findATAAddrSync } from '@uxdprotocol/uxd-client'

export async function createBondedMintATA({
  payer,
  authority,
  bondedMint,
}: {
  payer: PublicKey
  authority: PublicKey
  bondedMint: PublicKey
}): Promise<TransactionInstruction> {
  const [bondedMintATA] = findATAAddrSync(authority, bondedMint)

  console.log('bondedMintATA', bondedMintATA.toString())

  const [tx] = await createAssociatedTokenAccount(payer, authority, bondedMint)

  return tx
}
