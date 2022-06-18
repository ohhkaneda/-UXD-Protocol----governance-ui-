import { Connection, PublicKey } from '@solana/web3.js';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { depositAllTokenTypesItx } from './lifinity';
import { PoolNames } from './poolList';

const depositToPool = ({
  connection,
  authority,
  liquidityPool,
  wallet,
  uiAmountTokenA,
  uiAmountTokenB,
  uiAmountTokenLP,
}: {
  connection: Connection;
  authority: PublicKey;
  liquidityPool: PoolNames;
  wallet: SignerWalletAdapter;
  uiAmountTokenA: number;
  uiAmountTokenB: number;
  uiAmountTokenLP: number;
  slippage: number;
}) => {
  return depositAllTokenTypesItx({
    connection,
    liquidityPool,
    uiAmountTokenA,
    uiAmountTokenB,
    uiAmountTokenLP,
    userTransferAuthority: authority,
    wallet,
  });
};

export default depositToPool;
