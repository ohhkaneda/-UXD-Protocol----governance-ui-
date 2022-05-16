import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { tryGetMint } from '@utils/tokens';
import { Controller, UXD_DECIMALS } from '@uxd-protocol/uxd-client';
import type { ConnectionContext } from 'utils/connection';
import {
  getDepositoryMintKey,
  getInsuranceMintKey,
  initializeMango,
  instantiateMangoDepository,
  uxdClient,
} from './uxdClient';

const createMintWithMangoDepositoryInstruction = async ({
  connection,
  uxdProgramId,
  uiCollateralAmount,
  slippage,
  authority,
  payer,
  depositoryMintName,
  insuranceMintName,
}: {
  connection: ConnectionContext;
  uxdProgramId: PublicKey;
  uiCollateralAmount: number;
  slippage: number;
  authority: PublicKey;
  payer: PublicKey;
  depositoryMintName: string;
  insuranceMintName: string;
}): Promise<TransactionInstruction> => {
  const mango = await initializeMango(connection.current, connection.cluster);

  const depositoryMint = getDepositoryMintKey(
    connection.cluster,
    depositoryMintName,
  );
  const insuranceMint = getInsuranceMintKey(
    connection.cluster,
    insuranceMintName,
  );

  const [depositoryMintInfo, insuranceMintInfo] = await Promise.all([
    tryGetMint(connection.current, depositoryMint),
    tryGetMint(connection.current, insuranceMint),
  ]);

  if (!depositoryMintInfo)
    throw new Error(`Cannot load mint info about ${depositoryMint.toBase58()}`);
  if (!insuranceMintInfo)
    throw new Error(`Cannot load mint info about ${insuranceMint.toBase58()}`);

  const depository = instantiateMangoDepository(
    uxdProgramId,
    depositoryMint,
    insuranceMint,
    depositoryMintName,
    depositoryMintInfo.account.decimals,
    insuranceMintName,
    insuranceMintInfo.account.decimals,
  );

  const client = uxdClient(uxdProgramId);

  return client.createMintWithMangoDepositoryInstruction(
    uiCollateralAmount,
    slippage,
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    depository,
    mango,
    authority,
    Provider.defaultOptions(),
    payer,
  );
};

export default createMintWithMangoDepositoryInstruction;
