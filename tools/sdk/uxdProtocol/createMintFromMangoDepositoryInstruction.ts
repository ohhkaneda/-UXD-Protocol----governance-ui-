import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
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

  const depository = instantiateMangoDepository(
    uxdProgramId,
    depositoryMint,
    insuranceMint,
    depositoryMintName,
    undefined,
    insuranceMintName,
    undefined,
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
