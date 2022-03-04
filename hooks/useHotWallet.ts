import { MintInfo, u64 } from '@solana/spl-token'
import BigNumber from 'bignumber.js'
import { PublicKey } from '@solana/web3.js'
import { SPL_TOKENS } from '@utils/splTokens'
import {
  getOwnedTokenAccounts,
  TokenProgramAccount,
  tryGetMint,
} from '@utils/tokens'
import { useCallback, useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import tokenService from '@utils/services/token'
import { BN } from '@project-serum/anchor'

const SOL_TREASURY_OWNER = new PublicKey(
  '7M6TSEkRiXiYmpRCcCDSdJGTGxAPem2HBqjW4gLQ2KoE'
)

export type HotWalletAccountInfo = {
  publicKey: PublicKey
  mint: PublicKey
  decimals: number
  amount: u64
  mintName?: string
  usdMintValue: number
  usdTotalValue: u64
}

function getSplTokenNameFromConstant(tokenMint: PublicKey): string | undefined {
  return Object.values(SPL_TOKENS).find(({ mint }) => mint.equals(tokenMint))
    ?.name
}

const useHotWallet = () => {
  const connection = useWalletStore((store) => store.connection)
  const [tokenAccountsInfo, setTokenAccountsInfo] = useState<
    HotWalletAccountInfo[] | null
  >(null)

  const loadTokenAccounts = useCallback(async () => {
    if (!connection.current) return

    const tokenAccounts = await getOwnedTokenAccounts(
      connection.current,
      SOL_TREASURY_OWNER
    )

    const tokenMintAddresses = [
      ...new Set(tokenAccounts.map(({ account: { mint } }) => mint)),
    ]

    const mintInfos = (
      await Promise.all(
        tokenMintAddresses.map((tokenMintAddress) =>
          tryGetMint(connection.current, tokenMintAddress)
        )
      )
    ).reduce(
      (acc, mintInfo) => {
        if (!mintInfo) throw new Error('Cannot load mint info')

        acc[mintInfo.publicKey.toBase58()] = {
          ...mintInfo,
          name: getSplTokenNameFromConstant(mintInfo.publicKey),
          usdValue: tokenService.getUSDTokenPrice(
            mintInfo.publicKey.toBase58()
          ),
        }

        return acc
      },
      {} as {
        [key: string]: TokenProgramAccount<MintInfo> & {
          name?: string
          usdValue: number
        }
      }
    )

    setTokenAccountsInfo(
      tokenAccounts.map((tokenAccount) => {
        const mintInfo = mintInfos[tokenAccount.account.mint.toBase58()]

        return {
          mint: tokenAccount.account.mint,
          publicKey: tokenAccount.publicKey,
          amount: tokenAccount.account.amount,
          decimals: mintInfo.account.decimals,
          mintName: mintInfo.name,
          usdMintValue: mintInfo.usdValue,
          usdTotalValue: new BN(
            new BigNumber(tokenAccount.account.amount.toString())
              .multipliedBy(mintInfo.usdValue)
              .integerValue()
              .toString()
          ),
        }
      })
    )
  }, [connection])

  useEffect(() => {
    loadTokenAccounts()
  }, [loadTokenAccounts])

  return {
    tokenAccountsInfo,
  }
}

export default useHotWallet
