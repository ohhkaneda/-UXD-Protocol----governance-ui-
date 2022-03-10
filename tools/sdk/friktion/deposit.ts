import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import type { Provider as AnchorProvider, BN } from '@project-serum/anchor'
import friktionConfiguration from './configuration'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { VoltSDK } from '@friktion-labs/friktion-sdk'
import { findATAAddrSync } from '@utils/ataTools'

export async function deposit({
  authority,
  payer,
  provider,
  depositAmount,
  sourceTokenAccount,
}: {
  authority: PublicKey
  payer: PublicKey
  provider: AnchorProvider
  depositAmount: BN
  sourceTokenAccount: PublicKey
}): Promise<TransactionInstruction> {
  const unconnectedVoltSdk = await friktionConfiguration.loadVoltSDK(provider)

  const pdaStr = 'FILL_ME'

  const {
    extraVoltKey,
    roundInfoKey,
    roundUnderlyingTokensKey,
    roundVoltTokensKey,
    pendingDepositInfoKey,
  } = await VoltSDK.findUsefulAddresses(
    unconnectedVoltSdk.voltKey,
    unconnectedVoltSdk.voltVault,
    authority,
    unconnectedVoltSdk.sdk.programs.Volt.programId
  )

  const [vaultTokenDestination] = findATAAddrSync(
    authority,
    unconnectedVoltSdk.voltVault.vaultMint
  )

  console.log('Friktion Deposit', {
    authority: authority.toString(),
    payer: payer.toString(),
    vaultMint: unconnectedVoltSdk.voltVault.vaultMint.toString(),
    voltVault: unconnectedVoltSdk.voltKey.toString(),
    vaultAuthority: unconnectedVoltSdk.voltVault.vaultAuthority.toString(),
    extraVoltData: extraVoltKey.toString(),
    depositPool: unconnectedVoltSdk.voltVault.depositPool.toString(),
    writerTokenPool: unconnectedVoltSdk.voltVault.writerTokenPool.toString(),
    vaultTokenDestination: vaultTokenDestination.toString(),
    underlyingTokenSource: sourceTokenAccount.toString(),
    roundInfo: roundInfoKey.toString(),
    roundVoltTokens: roundVoltTokensKey.toString(),
    roundUnderlyingTokens: roundUnderlyingTokensKey.toString(),
    pendingDepositInfo: pendingDepositInfoKey.toString(),
    systemProgram: SystemProgram.programId.toString(),
    tokenProgram: TOKEN_PROGRAM_ID.toString(),
    pdaStr,
    depositAmount: depositAmount.toString(),
    underlyingAssetMint: unconnectedVoltSdk.voltVault.underlyingAssetMint.toString(),
  })

  return unconnectedVoltSdk.sdk.programs.Volt.instruction.depositDao(
    depositAmount,
    pdaStr,
    {
      accounts: {
        authority,
        payer,
        vaultMint: unconnectedVoltSdk.voltVault.vaultMint,
        voltVault: unconnectedVoltSdk.voltKey,
        vaultAuthority: unconnectedVoltSdk.voltVault.vaultAuthority,
        extraVoltData: extraVoltKey,
        depositPool: unconnectedVoltSdk.voltVault.depositPool,
        writerTokenPool: unconnectedVoltSdk.voltVault.writerTokenPool,
        vaultTokenDestination,
        underlyingTokenSource: sourceTokenAccount,
        roundInfo: roundInfoKey,
        roundVoltTokens: roundVoltTokensKey,
        roundUnderlyingTokens: roundUnderlyingTokensKey,
        pendingDepositInfo: pendingDepositInfoKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    }
  )
}
