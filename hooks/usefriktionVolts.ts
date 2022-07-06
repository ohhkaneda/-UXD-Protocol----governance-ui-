import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getVolts, VoltList } from '@tools/sdk/friktion/friktion';
import { Wallet } from '@project-serum/anchor';

const useFriktionVolt = ({
  connection,
  wallet,
  governedAccountPubkey,
}: {
  connection: Connection;
  wallet: Wallet;
  governedAccountPubkey?: PublicKey;
}) => {
  const [friktionVolts, setFriktionVolts] = useState<VoltList | null>(null);

  useEffect(() => {
    // call for the mainnet friktion volts
    (async () => {
      if (!governedAccountPubkey) return;

      const volts = await getVolts({
        connection,
        wallet,
        governancePubkey: governedAccountPubkey,
      });
      setFriktionVolts(volts);
    })();
  }, [governedAccountPubkey]);

  return { friktionVolts };
};

export default useFriktionVolt;
