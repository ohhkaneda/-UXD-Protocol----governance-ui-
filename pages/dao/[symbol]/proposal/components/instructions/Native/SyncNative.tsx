import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { SyncNativeInstructionForm } from '@utils/uiTypes/proposalCreationTypes';
import { GovernedMultiTypeAccount, tryGetTokenAccount } from '@utils/tokens';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { findATAAddrSync } from '@uxdprotocol/uxd-staking-client';
import { SPL_TOKENS } from '@utils/splTokens';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { struct, u8 } from 'buffer-layout';

function createSyncNativeInstruction(
  account: PublicKey,
  programId = TOKEN_PROGRAM_ID,
): TransactionInstruction {
  const keys = [{ pubkey: account, isSigner: false, isWritable: true }];

  const syncNativeInstructionData = struct([u8('instruction')]);

  const data = Buffer.alloc(syncNativeInstructionData.span);

  syncNativeInstructionData.encode({ instruction: 17 }, data);

  return new TransactionInstruction({ keys, programId, data });
}

const SyncNative = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    governedAccountPubkey,
    connection,
  } = useInstructionFormBuilder<SyncNativeInstructionForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Governed account is required'),
    }),

    buildInstruction: async function ({ governedAccountPubkey }) {
      const [wsolATA] = findATAAddrSync(
        governedAccountPubkey,
        SPL_TOKENS.WSOL.mint,
      );

      return createSyncNativeInstruction(
        new PublicKey(wsolATA),
        TOKEN_PROGRAM_ID,
      );
    },
  });

  const [wsolATAInfo, setWsolATAInfo] = useState<{
    pubkey: PublicKey;
    isInitialized: boolean;
  } | null>(null);

  useEffect(() => {
    (async () => {
      if (!governedAccountPubkey) return;

      const [wsolATA] = findATAAddrSync(
        governedAccountPubkey,
        SPL_TOKENS.WSOL.mint,
      );

      const tokenAccount = await tryGetTokenAccount(
        connection.current,
        wsolATA,
      );

      console.log('tokenAccount', tokenAccount);

      setWsolATAInfo({
        pubkey: wsolATA,
        isInitialized:
          tokenAccount && tokenAccount.account.isInitialized ? true : false,
      });
    })();
  }, [governedAccountPubkey]);

  if (!wsolATAInfo) {
    return <div className="mt-6 mb-6 text-sm">loading...</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="mt-6 mb-6">
        <span className="text-sm">WSOL ATA:</span>

        <span className="text-xs ml-2 bg-fgd-4 p-2">
          {wsolATAInfo.pubkey.toBase58()}
        </span>
      </div>

      {wsolATAInfo.isInitialized === false ? (
        <span className="text-xs text-red mb-2">
          Warning: Account is not initialized
        </span>
      ) : null}
    </div>
  );
};

export default SyncNative;
