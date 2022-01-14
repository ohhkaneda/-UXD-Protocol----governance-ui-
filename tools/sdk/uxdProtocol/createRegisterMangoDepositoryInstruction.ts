import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { Provider } from '@project-serum/anchor'
import { Token, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@utils/tokens'
import { Controller, findATAAddrSync } from '@uxdprotocol/uxd-client'
import type { ConnectionContext } from 'utils/connection'
import {
  getControllerPda,
  getDepositoryMintKey,
  getInsuranceMintKey,
  initializeMango,
  instantiateMangoDepository,
  uxdClient,
} from './uxdClient'

const createRegisterMangoDepositoryInstruction = async (
  connection: ConnectionContext,
  uxdProgramId: PublicKey,
  authority: PublicKey,
  payer: PublicKey,
  depositoryMintName: string,
  insuranceMintName: string
): Promise<TransactionInstruction> => {
  const mango = await initializeMango(connection.current, connection.cluster)

  const depositoryMint = getDepositoryMintKey(
    connection.cluster,
    depositoryMintName
  )
  const insuranceMint = getInsuranceMintKey(
    connection.cluster,
    insuranceMintName
  )

  const depository = instantiateMangoDepository(
    uxdProgramId,
    depositoryMint,
    insuranceMint
  )

  const client = uxdClient(uxdProgramId)
  const [authorityInsuranceATA] = findATAAddrSync(authority, insuranceMint)
  const createAuthorityInsuranceItx = Token.createAssociatedTokenAccountInstruction(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    insuranceMint,
    findATAAddrSync(authority, insuranceMint)[0],
    authority, // owner
    payer // payer
  )

  console.log(
    `Initialize Authority Insurance ATA (${authorityInsuranceATA.toBase58()}) itx:`,
    serializeInstructionToBase64(createAuthorityInsuranceItx)
  )

  return client.createRegisterMangoDepositoryInstruction(
    { pda: getControllerPda(uxdProgramId) } as Controller,
    depository,
    mango,
    authority,
    Provider.defaultOptions(),
    payer
  )
}

export default createRegisterMangoDepositoryInstruction
