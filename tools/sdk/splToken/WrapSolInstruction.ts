import { BN } from '@project-serum/anchor'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { SPL_TOKENS } from '@utils/splTokens'
import { findATAAddrSync } from '@uxdprotocol/uxd-client'

export async function wrapSolInstruction({
  lamports,
  owner,
}: {
  lamports: BN
  owner: PublicKey
}): Promise<TransactionInstruction> {
  console.log(
    'getAssociatedTokenAddress',
    ASSOCIATED_TOKEN_PROGRAM_ID.toString(),
    TOKEN_PROGRAM_ID.toString(),
    SPL_TOKENS.WSOL.mint.toString(),
    owner.toString()
  )

  const [toPubkey] = findATAAddrSync(owner, SPL_TOKENS.WSOL.mint)

  /*
  const toPubkey = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    SPL_TOKENS.WSOL.mint,
    owner
  )*/

  console.log({
    fromPubkey: owner.toString(),
    toPubkey: toPubkey.toString(),
    lamports: lamports.toNumber(),
  })

  // return Token.createTransferInstruction(TOKEN_PROGRAM_ID, owner, toPubkey, owner, [], lamports.toNumber())

  return SystemProgram.transfer({
    fromPubkey: owner,
    toPubkey,
    lamports: lamports.toNumber(),
  })
}
