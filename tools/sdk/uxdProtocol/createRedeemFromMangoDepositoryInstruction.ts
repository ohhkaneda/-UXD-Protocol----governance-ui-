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

const createRedeemFromMangoDepositoryInstruction = async ({
  amountRedeemable,
  slippage,
  connection,
  authority,
  depositoryMintName,
  insuranceMintName,
}: {
  amountRedeemable: BN
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

  return client.createRedeemFromMangoDepositoryInstruction(
    amountRedeemable.toNumber(),
    slippage,
    new Controller('UXD', UXD_DECIMALS, UXD_PROGRAM_ID),
    depository,
    mango,
    authority,
    TXN_OPTS
  )
}

export default createRedeemFromMangoDepositoryInstruction
