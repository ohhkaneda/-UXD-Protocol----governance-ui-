import { FriktionSDK, ConnectedVoltSDK } from '@friktion-labs/friktion-sdk';
import { Connection, PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { Wallet } from '@project-serum/sol-wallet-adapter';
import { findATAAddrSync } from '@utils/ataTools';

const withdrawFromVault = async ({
  connection,
  wallet,
  voltVaultId,
  governancePubkey,
  amount,
}: {
  connection: Connection;
  wallet: Wallet;
  voltVaultId: string;
  governancePubkey: PublicKey;
  amount: BN;
}) => {
  const sdk = new FriktionSDK({
    provider: {
      connection,
      wallet,
    },
  });
  console.log('voltVaultId', voltVaultId);
  const cVoltSDK = new ConnectedVoltSDK(
    connection,
    governancePubkey,
    await sdk.loadVoltByKey(new PublicKey(voltVaultId)),
  );

  const [govVoltMintATA] = findATAAddrSync(
    governancePubkey,
    cVoltSDK.voltVault.vaultMint,
  );
  const [govUnderlyingATA] = findATAAddrSync(
    governancePubkey,
    cVoltSDK.voltVault.underlyingAssetMint,
  );

  return cVoltSDK.withdraw(
    amount,
    govVoltMintATA,
    govUnderlyingATA,
    governancePubkey,
  );
};

export default withdrawFromVault;
