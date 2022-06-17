import BigNumber from 'bignumber.js';
import * as mplCore from '@metaplex-foundation/mpl-core';
import * as mplTokenMetadata from '@metaplex-foundation/mpl-token-metadata';
import { Program, Provider } from '@project-serum/anchor';
import { Wallet } from '@project-serum/sol-wallet-adapter';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { Connection, PublicKey } from '@solana/web3.js';
import { findATAAddrSync } from '@utils/ataTools';
import { uiAmountToNativeBigN, uiAmountToNativeBN } from '../units';
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

const getWalletNftAccounts = async ({
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
      new mplCore.Account(mintAddress, mintAccInfo),
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

export const getLPTokenBalance = async ({
  connection,
  liquidityPool,
  wallet,
}: {
  connection: Connection;
  liquidityPool: PoolNames;
  wallet: PublicKey;
}) => {
  const pool = getPoolByLabel(liquidityPool);
  const lpMint = new PublicKey(pool.poolMint);
  const [lpTokenAccount] = findATAAddrSync(wallet, lpMint);
  const [lpInfo, lpUserBalance] = await Promise.all([
    connection.getTokenSupply(lpMint),
    connection.getTokenAccountBalance(lpTokenAccount),
  ]);

  return {
    lpTokenAccount,
    maxBalance: lpUserBalance.value.uiAmount ?? 0,
    decimals: lpInfo.value.decimals,
  };
};

export const getWithdrawOut = async ({
  connection,
  liquidityPool,
  lpTokenAmount,
  slippage,
}: {
  connection: Connection;
  liquidityPool: PoolNames;
  lpTokenAmount: number;
  slippage: number;
}) => {
  const pool = getPoolByLabel(liquidityPool);

  const [lpAccount, poolAccountTokenA, poolAccountTokenB] = await Promise.all([
    connection.getTokenSupply(new PublicKey(pool.poolMint)),
    connection.getTokenAccountBalance(new PublicKey(pool.poolCoinTokenAccount)),
    connection.getTokenAccountBalance(new PublicKey(pool.poolPcTokenAccount)),
  ]);

  const minimumTokenAAmount = calculateMinimumTokenWithdrawAmountFromLP({
    tokenBalance: poolAccountTokenA.value.amount,
    tokenDecimals: pool.poolCoinDecimal,
    lpAmount: lpTokenAmount.toString(),
    lpSupply: lpAccount.value.amount,
    slippage,
  });

  const minimumTokenBAmount = calculateMinimumTokenWithdrawAmountFromLP({
    tokenBalance: poolAccountTokenB.value.amount,
    tokenDecimals: pool.poolCoinDecimal,
    lpAmount: lpTokenAmount.toString(),
    lpSupply: lpAccount.value.amount,
    slippage,
  });

  return {
    uiAmountTokenA: minimumTokenAAmount.toNumber(),
    uiAmountTokenB: minimumTokenBAmount.toNumber(),
  };
};

const calculateMinimumTokenWithdrawAmountFromLP = ({
  tokenBalance,
  tokenDecimals,
  lpAmount,
  lpSupply,
  slippage,
}: {
  tokenBalance: string;
  tokenDecimals: number;
  lpAmount: string;
  lpSupply: string;
  slippage: number | string;
}) => {
  const tokenBalanceBN = new BigNumber(tokenBalance);
  const percent = new BigNumber(+slippage + 100).div(new BigNumber(100));
  const lpAmountBN = new BigNumber(lpAmount);
  const lpSupplyBN = new BigNumber(lpSupply);

  return tokenBalanceBN
    .multipliedBy(lpAmountBN)
    .dividedBy(lpSupplyBN)
    .dividedBy(percent)
    .decimalPlaces(tokenDecimals);
};

const getOutAmount = (
  poolInfo: IPoolInfo,
  amount: number | string,
  fromCoinMint: PublicKey,
  toCoinMint: PublicKey,
  slippage: number,
  coinBalance: BigNumber,
  pcBalance: BigNumber,
): BigNumber => {
  const price = pcBalance.dividedBy(coinBalance);

  const fromAmount = new BigNumber(amount);

  const percent = new BigNumber(100)
    .plus(new BigNumber(slippage))
    .dividedBy(new BigNumber(100));

  if (!coinBalance || !pcBalance) {
    return new BigNumber(0);
  }

  if (
    fromCoinMint.equals(poolInfo.poolCoinMint) &&
    toCoinMint.equals(poolInfo.poolPcMint)
  ) {
    // outcoin is pc
    return fromAmount.multipliedBy(price).multipliedBy(percent);
  }

  if (
    fromCoinMint === poolInfo.poolPcMint &&
    toCoinMint === poolInfo.poolCoinMint
  ) {
    // outcoin is coin
    return fromAmount.dividedBy(percent).dividedBy(price);
  }

  return new BigNumber(0);
};

export const getDepositOut = async ({
  connection,
  uiAmountTokenA,
  slippage,
  poolLabel,
}: {
  connection: Connection;
  wallet: SignerWalletAdapter;
  uiAmountTokenA: number;
  slippage: number;
  poolLabel: PoolNames;
}): Promise<{
  amountIn: number;
  amountOut: number;
  lpReceived: number;
}> => {
  const pool = getPoolByLabel(poolLabel);
  const amount = new BigNumber(uiAmountTokenA.toString());

  const {
    poolMint,
    poolCoinTokenAccount,
    poolPcTokenAccount,
    poolCoinMint: coinAddress,
    poolPcMint: pcAddress,
    poolCoinDecimal,
    poolMintDecimal,
    poolPcDecimal,
  } = pool;

  const [lpSup, coin, pc] = await Promise.all([
    connection.getTokenSupply(poolMint),
    connection.getTokenAccountBalance(poolCoinTokenAccount),
    connection.getTokenAccountBalance(poolPcTokenAccount),
  ]);

  const lpSupply = uiAmountToNativeBigN(
    lpSup.value.amount,
    lpSup.value.decimals,
  );

  const coinBalance = uiAmountToNativeBigN(
    coin.value.amount,
    coin.value.decimals,
  );

  const pcBalance = uiAmountToNativeBigN(pc.value.amount, pc.value.decimals);

  const outAmount = getOutAmount(
    pool,
    amount.toString(),
    coinAddress,
    pcAddress,
    slippage,
    coinBalance,
    pcBalance,
  );

  // Bruh
  const lpReceived =
    Math.floor(
      ((amount.toNumber() * Math.pow(10, poolCoinDecimal)) /
        coinBalance.toNumber()) *
        lpSupply.toNumber(),
    ) / Math.pow(10, poolMintDecimal);

  const amountOut =
    Math.floor(outAmount.toNumber() * Math.pow(10, poolPcDecimal)) /
    Math.pow(10, poolPcDecimal);

  return {
    amountIn: uiAmountTokenA,
    amountOut,
    lpReceived,
  };
};

export const poolLabels = Object.keys(PoolList) as PoolNames[];

export const getPoolByLabel = (label: PoolNames): IPoolInfo => PoolList[label];

export const getPoolLabelByPoolMint = (mint: PublicKey) => {
  const [label] = Object.entries(PoolList).find(([, data]) =>
    data.poolMint.equals(mint),
  ) ?? ['not found'];

  return label;
};

export const depositAllTokenTypesItx = async ({
  connection,
  liquidityPool,
  uiAmountTokenA,
  uiAmountTokenB,
  uiAmountTokenLP,
  userTransferAuthority,
  wallet,
}: {
  connection: Connection;
  liquidityPool: PoolNames;
  uiAmountTokenA: number;
  uiAmountTokenB: number;
  uiAmountTokenLP: number;
  userTransferAuthority: PublicKey;
  wallet: Wallet;
}) => {
  const program = buildLifinity({ connection, wallet });

  const {
    amm,
    poolCoinMint,
    poolPcMint,
    poolMint,
    poolMintDecimal,
    poolCoinDecimal,
    poolPcDecimal,
    poolCoinTokenAccount,
    poolPcTokenAccount,
    configAccount,
  } = getPoolByLabel(liquidityPool);

  const [authority] = await PublicKey.findProgramAddress(
    [amm.toBuffer()],
    program.programId,
  );
  const [sourceAInfo] = findATAAddrSync(userTransferAuthority, poolCoinMint);
  const [sourceBInfo] = findATAAddrSync(userTransferAuthority, poolPcMint);
  const [destination] = findATAAddrSync(userTransferAuthority, poolMint);

  const nftAccounts = await getWalletNftAccounts({
    connection,
    wallet: userTransferAuthority,
  });

  if (!nftAccounts) {
    throw new Error('Wallet does not hold Lifinity Igniter');
  }

  const { lifinityNftAccount, lifinityNftMetaAccount } = nftAccounts;

  return program.instruction.depositAllTokenTypes(
    uiAmountToNativeBN(uiAmountTokenLP, poolMintDecimal),
    uiAmountToNativeBN(uiAmountTokenA, poolCoinDecimal),
    uiAmountToNativeBN(uiAmountTokenB, poolPcDecimal),
    {
      accounts: {
        amm,
        authority,
        sourceAInfo,
        sourceBInfo,
        poolMint,
        destination,
        configAccount,
        lifinityNftAccount,
        lifinityNftMetaAccount,
        userTransferAuthorityInfo: userTransferAuthority,
        tokenA: poolCoinTokenAccount,
        tokenB: poolPcTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        holderAccountInfo: userTransferAuthority,
      },
      instructions: [],
      signers: [],
    },
  );
};
