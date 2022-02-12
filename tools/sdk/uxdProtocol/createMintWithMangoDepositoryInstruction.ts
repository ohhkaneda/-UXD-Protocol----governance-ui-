import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import {
  Controller,
  MangoDepository,
  SOL_DECIMALS,
  USDC_DECIMALS,
  UXD_DECIMALS,
} from '@uxdprotocol/uxd-client'
import type { ConnectionContext } from 'utils/connection'
import {
  uxdClient,
  initializeMango,
  getDepositoryMintKey,
  getInsuranceMintKey,
  UXD_PROGRAM_ID,
} from './uxdClient'

const createMintWithMangoDepositoryInstruction = async ({
  collateralUiAmount,
  slippage,
  connection,
  authority,
  depositoryMintName,
  insuranceMintName,
}: {
  collateralUiAmount: number
  slippage: number
  connection: ConnectionContext
  authority: PublicKey
  depositoryMintName: string
  insuranceMintName: string
}): Promise<TransactionInstruction> => {
  /*
  const TXN_OPTS: ConfirmOptions = {
    commitment: 'confirmed',
    preflightCommitment: 'processed',
    skipPreflight: false,
  }
  */

  const client = uxdClient(UXD_PROGRAM_ID)

  const mango = await initializeMango(connection.current, connection.cluster)

  const depository = new MangoDepository(
    getDepositoryMintKey(connection.cluster, depositoryMintName),
    depositoryMintName,
    SOL_DECIMALS,
    getInsuranceMintKey(connection.cluster, insuranceMintName),
    insuranceMintName,
    USDC_DECIMALS,
    UXD_PROGRAM_ID
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
    collateralAmount: collateralUiAmount,
    client,
    mango,
    depository,
  })

  const controller = new Controller('UXD', UXD_DECIMALS, UXD_PROGRAM_ID)

  return client.createMintWithMangoDepositoryInstruction(
    collateralUiAmount,
    slippage,
    controller,
    depository,
    mango,
    authority,
    {} //  TXN_OPTS
  )
}

export default createMintWithMangoDepositoryInstruction
