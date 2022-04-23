import { FriktionSDK, ConnectedVoltSDK } from '@friktion-labs/friktion-sdk';
import { Connection, PublicKey } from '@solana/web3.js';
import { Wallet } from '@project-serum/sol-wallet-adapter';
import Decimal from 'decimal.js';
import { findATAAddrSync } from '@utils/ataTools';

const depositToVolt = async ({
  connection,
  wallet,
  voltVaultId,
  governancePubkey,
  receiverAddress,
  amount,
  decimals,
}: {
  connection: Connection;
  wallet: Wallet;
  voltVaultId: string;
  governancePubkey: PublicKey;
  receiverAddress: PublicKey;
  amount: number;
  decimals: number;
}) => {
  const sdk = new FriktionSDK({
    provider: {
      connection,
      wallet,
    },
  });
  const cVoltSDK = new ConnectedVoltSDK(
    connection,
    governancePubkey,
    await sdk.loadVoltByKey(new PublicKey(voltVaultId)),
  );

  //const voltVault = cVoltSDK.voltVault;
  const vaultMint = cVoltSDK.voltVault.vaultMint;

  const [govATA] = findATAAddrSync(governancePubkey, vaultMint);

  return cVoltSDK.deposit(
    new Decimal(amount),
    govATA,
    receiverAddress,
    governancePubkey,
    decimals,
  );
};

export default depositToVolt;
