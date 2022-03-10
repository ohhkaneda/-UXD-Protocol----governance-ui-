import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js'
import type { Provider as AnchorProvider, BN } from '@project-serum/anchor'
import friktionConfiguration from './configuration'
import Decimal from 'decimal.js'
import { ConnectedVoltSDK } from '@friktion-labs/friktion-sdk'
import { findATAAddrSync } from '@utils/ataTools'

export async function deposit({
  authority,
  payer,
  connection,
  provider,
  depositAmount,
  sourceTokenAccount,
}: {
  authority: PublicKey
  payer: PublicKey
  connection: Connection
  provider: AnchorProvider
  depositAmount: BN
  sourceTokenAccount: PublicKey
}): Promise<TransactionInstruction> {
  const cVoltSDK = new ConnectedVoltSDK(
    connection,
    payer,
    await friktionConfiguration.loadVoltSDK(provider),
    undefined,
    authority
  )

  const [vaultTokenDestination] = findATAAddrSync(
    authority,
    cVoltSDK.voltVault.vaultMint
  )

  console.log('vaultTokenDestination', vaultTokenDestination.toString())

  return cVoltSDK.deposit(
    new Decimal(depositAmount.toString()),
    sourceTokenAccount,
    vaultTokenDestination,
    authority,
    6
  )
}
