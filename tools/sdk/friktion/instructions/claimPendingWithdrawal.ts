import { FriktionSDK, ConnectedVoltSDK } from '@friktion-labs/friktion-sdk';
import { Wallet } from '@project-serum/common';
import { Connection, PublicKey } from '@solana/web3.js';
import { findATAAddrSync } from '@utils/ataTools';

const claimPendingWithdrawal = async ({
  connection,
  wallet,
  governancePubkey,
  voltVaultId,
}: {
  connection: Connection;
  wallet: Wallet;
  governancePubkey: PublicKey;
  voltVaultId: string;
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
  const [govVoltMintATA] = findATAAddrSync(
    governancePubkey,
    cVoltSDK.voltVault.vaultMint,
  );

  return cVoltSDK.claimPending(new PublicKey(govVoltMintATA));
};

export default claimPendingWithdrawal;
