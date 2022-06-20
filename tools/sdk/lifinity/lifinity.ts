import BigNumber from 'bignumber.js';
import * as mplCore from '@metaplex-foundation/mpl-core';
import * as mplTokenMetadata from '@metaplex-foundation/mpl-token-metadata';
import { Program, Provider } from '@project-serum/anchor';
import { Wallet } from '@project-serum/sol-wallet-adapter';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { Connection, PublicKey } from '@solana/web3.js';
import { findATAAddrSync } from '@utils/ataTools';
import { LifinityAmmIDL } from './idl/lifinity_amm_idl';
import { IPoolInfo, PoolList, PoolNames } from './poolList';

export const AMM_PROGRAM_ADDR = new PublicKey(
  'EewxydAPCCVuNEyrVN68PuSYdQ7wKn27V9Gjeoi8dy3S',
);

export const buildLifinity = ({
  connection,
  wallet,
}: {
  connection: Connection;
  wallet: Wallet;
}) => {
  return new Program(
    LifinityAmmIDL,
    AMM_PROGRAM_ADDR,
    new Provider(connection, wallet, Provider.defaultOptions()),
  );
};

export const getWalletNftAccounts = async ({
  connection,
  wallet,
}: {
  connection: Connection;
  wallet: PublicKey;
}): Promise<{
  lifinityNftAccount: PublicKey;
  lifinityNftMetaAccount: PublicKey;
} | null> => {
  const {
    value: parsedTokenAccounts,
  } = await connection.getParsedTokenAccountsByOwner(
    wallet,
    {
      programId: TOKEN_PROGRAM_ID,
    },
    'confirmed',
  );

  for (const tokenAccountInfo of parsedTokenAccounts) {
    const {
      pubkey: tokenAccountPubkey,
      account: {
        data: {
          parsed: {
            info: {
              mint,
              tokenAmount: { amount },
            },
          },
        },
      },
    } = tokenAccountInfo;

    if (amount <= 0) {
      continue;
    }

    const metadataPDA = await mplTokenMetadata.Metadata.getPDA(mint);
    const mintAccInfo = await connection.getAccountInfo(metadataPDA);

    if (!mintAccInfo) {
      continue;
    }

    const {
      data: { updateAuthority },
    } = mplTokenMetadata.Metadata.from(
      // @ts-ignore
      new mplCore.Account(mint, mintAccInfo),
    );

    if (
      updateAuthority !== 'BihU63mFnjLaBNPXxaDj8WUPBepZqqB4T2RHBJ99f2xo' &&
      updateAuthority !== 'H5q7Z2FJ5KaWmtGquGqoYJYrM73BEpoabzas5y12s38T'
    ) {
      continue;
    }

    return {
      lifinityNftAccount: tokenAccountPubkey,
      lifinityNftMetaAccount: metadataPDA,
    };
  }

  return null;
};

export const getUserLiquidityPoolTokenUiBalance = async ({
  connection,
  poolName,
  wallet,
}: {
  connection: Connection;
  poolName: PoolNames;
  wallet: PublicKey;
}): Promise<number> => {
  const {
    lpToken: { mint: lpTokenMint },
  } = getPoolInfoByName(poolName);

  const [lpTokenATA] = findATAAddrSync(wallet, lpTokenMint);

  const lpUserBalance = await connection.getTokenAccountBalance(lpTokenATA);

  return lpUserBalance.value.uiAmount ?? 0;
};

// Calculate how much tokenA and tokenB will be withdrawn from the pool
// at its current state for the provided amount of LP tokens
export const calculateMinimumWithdrawAmounts = async ({
  connection,
  poolName,
  uiLpTokenAmount,
  slippage,
}: {
  connection: Connection;
  poolName: PoolNames;
  uiLpTokenAmount: number;
  slippage: number;
}): Promise<{
  minimumWithdrawnAmountTokenA: BigNumber;
  minimumWithdrawnAmountTokenB: BigNumber;
  lpTokenAmount: BigNumber;
  minimumWithdrawnUiAmountTokenA: number;
  minimumWithdrawnUiAmountTokenB: number;
  uiLpTokenAmount: number;
}> => {
  const {
    lpToken: { mint: lpTokenMint, decimals: lpTokenDecimals },
    tokenA: { tokenAccount: tokenAccountTokenA, decimals: decimalsTokenA },
    tokenB: { tokenAccount: tokenAccountTokenB, decimals: decimalsTokenB },
  } = getPoolInfoByName(poolName);

  const [
    lpAccount,
    {
      value: { amount: balanceTokenA },
    },
    {
      value: { amount: balanceTokenB },
    },
  ] = await Promise.all([
    connection.getTokenSupply(lpTokenMint),
    connection.getTokenAccountBalance(tokenAccountTokenA),
    connection.getTokenAccountBalance(tokenAccountTokenB),
  ]);

  const lpAmount = new BigNumber(uiLpTokenAmount).decimalPlaces(
    lpTokenDecimals,
  );

  const minimumWithdrawnAmountTokenA = calculateMinimumTokenWithdrawAmountFromLP(
    {
      tokenBalance: new BigNumber(balanceTokenA),
      lpSupply: lpAccount.value.amount,
      lpAmount,
      slippage,
    },
  );

  const minimumWithdrawnAmountTokenB = calculateMinimumTokenWithdrawAmountFromLP(
    {
      tokenBalance: new BigNumber(balanceTokenB),
      lpSupply: lpAccount.value.amount,
      lpAmount,
      slippage,
    },
  );

  return {
    minimumWithdrawnAmountTokenA,
    minimumWithdrawnAmountTokenB,
    lpTokenAmount: new BigNumber(uiLpTokenAmount).decimalPlaces(
      lpTokenDecimals,
    ),
    minimumWithdrawnUiAmountTokenA: minimumWithdrawnAmountTokenA
      .dividedBy(new BigNumber(10).pow(decimalsTokenA))
      .toNumber(),
    minimumWithdrawnUiAmountTokenB: minimumWithdrawnAmountTokenB
      .dividedBy(new BigNumber(10).pow(decimalsTokenB))
      .toNumber(),
    uiLpTokenAmount,
  };
};

const calculateMinimumTokenWithdrawAmountFromLP = ({
  tokenBalance,
  lpAmount,
  lpSupply,
  slippage,
}: {
  tokenBalance: BigNumber;
  lpAmount: BigNumber;
  lpSupply: string;
  slippage: number | string;
}) => {
  const percent = new BigNumber(+slippage + 100).div(new BigNumber(100));

  // Example

  // The pool contains 2 tokens
  //
  // Token A => 20 tokens
  // Token B => 20 tokens
  //
  // Their price is the same, 1 token A == 1 token B
  //
  // It exists 100 liquidity pool tokens (lpSupply)
  //
  //
  // Imagine the users wants to withdraw for 10 LP tokens from the pool with a 2% slippage
  // the calculation are:
  //
  // 20 * 10 / 100 / ((100 + 2) / 100) = 1.96078431373
  //
  // The user will receive 1.96 Token for withdrawing for 10 LP tokens.

  return tokenBalance
    .multipliedBy(lpAmount)
    .dividedBy(lpSupply)
    .dividedBy(percent);
};

// Calculate the maximum amount of Token A and Token B to deposit to get a specific LP Token amount
// Do the calculation based on the current state of the pool, slippage and an amount of Token A
export const calculateDepositAmounts = async ({
  connection,
  uiAmountTokenA,
  slippage,
  poolName,
}: {
  connection: Connection;
  wallet: SignerWalletAdapter;
  uiAmountTokenA: number;
  slippage: number;
  poolName: PoolNames;
}): Promise<{
  maximumAmountTokenA: BigNumber;
  maximumAmountTokenB: BigNumber;
  amountLpToken: BigNumber;
  maximumUiAmountTokenA: number;
  maximumUiAmountTokenB: number;
  uiAmountLpToken: number;
}> => {
  const poolInfo = getPoolInfoByName(poolName);

  const {
    lpToken: { mint: mintLpToken, decimals: decimalsLpToken },
    tokenA: { decimals: decimalsTokenA, tokenAccount: tokenAccountTokenA },
    tokenB: { decimals: decimalsTokenB, tokenAccount: tokenAccountTokenB },
  } = poolInfo;

  // Pool Coin === Token A
  // Pool Pc === Token B

  const [
    rawLiquidityPoolTokenSupply,
    rawBalanceTokenA,
    rawBalanceTokenB,
  ] = await Promise.all([
    connection.getTokenSupply(mintLpToken),
    connection.getTokenAccountBalance(tokenAccountTokenA),
    connection.getTokenAccountBalance(tokenAccountTokenB),
  ]);

  const lpTokenSupply = new BigNumber(rawLiquidityPoolTokenSupply.value.amount);
  const balanceTokenA = new BigNumber(rawBalanceTokenA.value.amount);
  const uiBalanceTokenA = rawBalanceTokenA.value.uiAmount ?? 0;
  const uiBalanceTokenB = rawBalanceTokenB.value.uiAmount ?? 0;

  // Example:
  // The pool contains 2 tokens
  //
  // Token A => 20 tokens
  // Token B => 20 tokens
  //
  // Their price is the same, 1 token A == 1 token B
  //
  // It exists 100 liquidity pool tokens (lpSupply)
  //
  // Imagine the users wants to deposit 10 token A in the pool with a 2% slippage
  // The calculation are:
  //
  // amountTokenB = amountTokenA * tokenAPrice * percent
  //         10.2 = 10 * (20 / 20) * ((100 + 2) / 100)
  //
  // amountLpToken = amountTokenA / balanceTokenA * lpTokenSupply
  //            50 = 10 / 20 * 100
  //
  // The user should deposit a maximum of 10.2 Token B along with Token B and will receive 50 LP Tokens

  const maximumAmountTokenA = new BigNumber(uiAmountTokenA)
    .multipliedBy(new BigNumber(10).pow(decimalsTokenA))
    .decimalPlaces(decimalsTokenA);
  const tokenAPrice = uiBalanceTokenB / uiBalanceTokenA;

  const percent = new BigNumber(100)
    .plus(new BigNumber(slippage))
    .dividedBy(new BigNumber(100));

  const maximumUiAmountTokenB = new BigNumber(uiAmountTokenA)
    .multipliedBy(tokenAPrice)
    .multipliedBy(percent)
    .toNumber();
  const amountLpToken = maximumAmountTokenA
    .dividedBy(balanceTokenA)
    .multipliedBy(lpTokenSupply);

  const maximumAmountTokenB = new BigNumber(maximumUiAmountTokenB)
    .multipliedBy(new BigNumber(10).pow(decimalsTokenB))
    .decimalPlaces(decimalsTokenB);
  const uiAmountLpToken = amountLpToken
    .dividedBy(new BigNumber(10).pow(decimalsLpToken))
    .toNumber();

  console.log('INFOS', {
    decimalsTokenA,
    tokenAPrice: tokenAPrice.toString(),
    balanceTokenA: balanceTokenA.toString(),
    uiBalanceTokenA: uiBalanceTokenA.toString(),
    uiBalanceTokenB: uiBalanceTokenB.toString(),
    percent: percent.toString(),
    slippage,
    uiAmountTokenA: uiAmountTokenA.toString(),
    maximumAmountTokenA: maximumAmountTokenA.toString(),
    maximumAmountTokenB: maximumAmountTokenB.toString(),
    maximumUiAmountTokenB: maximumUiAmountTokenB.toString(),
    uiAmountLpToken: uiAmountLpToken.toString(),
    amountLpToken: amountLpToken.toString(),
  });

  /*
  // Bruh
  const lpReceived =
    new BigNumber(
      Math.floor(
        ((amount.toNumber() * Math.pow(10, poolCoinDecimal)) /
          coinBalance.toNumber()) *
        lpSupply.toNumber(),
      ) / Math.pow(10, poolMintDecimal)).dividedBy(10 ** poolMintDecimal);

  const amountOut =
    Math.floor(outAmount.toNumber() * Math.pow(10, poolPcDecimal)) /
    Math.pow(10, poolPcDecimal);
      */

  return {
    maximumUiAmountTokenA: uiAmountTokenA,
    maximumUiAmountTokenB,
    uiAmountLpToken,
    maximumAmountTokenA,
    maximumAmountTokenB,
    amountLpToken,
  };
};

export const poolLabels = Object.keys(PoolList) as PoolNames[];

export const getPoolInfoByName = (label: PoolNames): IPoolInfo =>
  PoolList[label];

export const getPoolNameByPoolTokenMint = (poolTokenMint: PublicKey) => {
  const [label] = Object.entries(PoolList).find(([, { lpToken: { mint } }]) =>
    mint.equals(poolTokenMint),
  ) ?? ['not found'];

  return label;
};
