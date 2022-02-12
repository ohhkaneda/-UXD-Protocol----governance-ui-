import { BN } from '@project-serum/anchor'
import {
  TransactionInstruction,
  PublicKey,
  ConfirmOptions,
} from '@solana/web3.js'
import { Controller, UXD_DECIMALS } from '@uxdprotocol/uxd-client'
import type { ConnectionContext } from 'utils/connection'
import {
  uxdClient,
  initializeMango,
  instantiateMangoDepository,
  getDepositoryMintKey,
  getInsuranceMintKey,
  UXD_PROGRAM_ID,
} from './uxdClient'

const createMintWithMangoDepositoryInstruction = async ({
  collateralAmount,
  slippage,
  connection,
  authority,
  depositoryMintName,
  insuranceMintName,
}: {
  collateralAmount: BN
  slippage: number
  connection: ConnectionContext
  authority: PublicKey
  depositoryMintName: string
  insuranceMintName: string
}): Promise<TransactionInstruction> => {
  const TXN_OPTS: ConfirmOptions = {
    commitment: 'confirmed',
    preflightCommitment: 'processed',
    skipPreflight: false,
  }

  const client = uxdClient(UXD_PROGRAM_ID)

  const mango = await initializeMango(connection.current, connection.cluster)

  const depository = instantiateMangoDepository(
    UXD_PROGRAM_ID,
    getDepositoryMintKey(connection.cluster, depositoryMintName),
    getInsuranceMintKey(connection.cluster, insuranceMintName)
  )

  console.log('createMintWithMangoDepositoryInstruction', {
    depositoryMintName,
    insuranceMintName,
    depositorMint: getDepositoryMintKey(
      connection.cluster,
      depositoryMintName
    ).toString(),
    insuranceMint: getInsuranceMintKey(
      connection.cluster,
      insuranceMintName
    ).toString(),

    slippage,
    UXD_PROGRAM_ID: UXD_PROGRAM_ID.toString(),
    authority: authority.toString(),
    collateralAmount: collateralAmount.toNumber(),
  })

  console.log('createMintWithMangoDepositoryInstruction', {
    client,
    mango,
    depository,
  })

  const controller = new Controller('UXD', UXD_DECIMALS, UXD_PROGRAM_ID)

  console.log('next', {
    TXN_OPTS,
    controller,
  })

  return client.createMintWithMangoDepositoryInstruction(
    collateralAmount.toNumber(),
    slippage,
    controller,
    depository,
    mango,
    authority,
    TXN_OPTS
  )
}

export default createMintWithMangoDepositoryInstruction
