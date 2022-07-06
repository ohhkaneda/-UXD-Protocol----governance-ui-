import { AnchorProvider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { Controller, UXD_DECIMALS } from '@uxd-protocol/uxd-client';
import type { ConnectionContext } from 'utils/connection';
import {
  uxdClient,
  initializeMango,
  instantiateMangoDepository,
  getDepositoryMintInfo,
  getInsuranceMintInfo,
} from './uxdClient';

const createDepositInsuranceToMangoDepositoryInstruction = async ({
  connection,
  uxdProgramId,
  authority,
  depositoryMintName,
  insuranceMintName,
  insuranceDepositedAmount,
}: {
  connection: ConnectionContext;
  uxdProgramId: PublicKey;
  authority: PublicKey;
  depositoryMintName: string;
  insuranceMintName: string;
  insuranceDepositedAmount: number;
}): Promise<TransactionInstruction> => {
  const client = uxdClient(uxdProgramId);

  const mango = await initializeMango(connection.current, connection.cluster);

  const { address: depositoryMint, decimals: depositoryDecimals } =
    getDepositoryMintInfo(connection.cluster, depositoryMintName);

  const { address: insuranceMint, decimals: insuranceDecimals } =
    getInsuranceMintInfo(connection.cluster, insuranceMintName);

  const depository = instantiateMangoDepository({
    uxdProgramId,
    depositoryMint,
    insuranceMint,
    depositoryName: depositoryMintName,
    depositoryDecimals,
    insuranceName: insuranceMintName,
    insuranceDecimals,
  });

  return client.createDepositInsuranceToMangoDepositoryInstruction(
    insuranceDepositedAmount,
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    depository,
    mango,
    authority,
    AnchorProvider.defaultOptions(),
  );
};

export default createDepositInsuranceToMangoDepositoryInstruction;
