import { struct, u8, nu64 } from 'buffer-layout';
import { AccountMetaData } from '@solana/spl-governance';
import { Connection } from '@solana/web3.js';
import { DeltafiDexV2 } from '@tools/sdk/deltafi/configuration';
import { tryGetMint } from '@utils/tokens';
import { fmtTokenAmount } from '@utils/formatting';
import { BN } from '@blockworks-foundation/mango-client';

export const DELTAFI_PROGRAM_INSTRUCTIONS = {
  [DeltafiDexV2.DeltafiProgramId.toBase58()]: {
    [DeltafiDexV2.instructionsCode.CreateLiquidityProviderV2]: {
      name: 'Deltafi - Create Liquidity Provider V2',
      accounts: [
        'marketConfig',
        'swapInfo',
        'liquidityProvider',
        'owner',
        'payer',
        'systemProgram',
        'rent',
      ],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          u8('SIGHASH_1'),
          u8('SIGHASH_2'),
          u8('SIGHASH_3'),
          u8('SIGHASH_4'),
          u8('SIGHASH_5'),
          u8('SIGHASH_6'),
          u8('SIGHASH_7'),
          u8('bump'),
        ]);

        const { bump } = dataLayout.decode(Buffer.from(data)) as any;

        const marketConfig = accounts[0].pubkey;
        const liquidityProvider = accounts[2].pubkey;
        const owner = accounts[3].pubkey;
        const payer = accounts[4].pubkey;

        return (
          <>
            <p>{`Bump: ${bump.toString()}`}</p>
            <p>{`Market Config: ${marketConfig.toBase58()}`}</p>
            <p>{`Liquidity Provider: ${liquidityProvider.toBase58()}`}</p>
            <p>{`Owner: ${owner.toBase58()}`}</p>
            <p>{`Payer: ${payer.toBase58()}`}</p>
          </>
        );
      },
    },

    [DeltafiDexV2.instructionsCode.WithdrawFromStableSwap]: {
      name: 'Deltafi - Withdraw from Stable Swap',
      accounts: [
        'swapInfo',
        'userTokenBase',
        'userTokenQuote',
        'liquidityProvider',
        'tokenBase',
        'tokenQuote',
        'pythPriceBase',
        'pythPriceQuote',
        'adminFeeTokenBase',
        'adminFeeTokenQuote',
        'userAuthority',
        'tokenProgram',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          u8('SIGHASH_1'),
          u8('SIGHASH_2'),
          u8('SIGHASH_3'),
          u8('SIGHASH_4'),
          u8('SIGHASH_5'),
          u8('SIGHASH_6'),
          u8('SIGHASH_7'),
          nu64('baseShare'),
          nu64('quoteShare'),
          nu64('minBaseAmount'),
          nu64('minQuoteAmount'),
        ]);

        const {
          baseShare,
          quoteShare,
          minBaseAmount,
          minQuoteAmount,
        } = dataLayout.decode(Buffer.from(data)) as any;

        const tokenBase = accounts[4].pubkey;
        const tokenQuote = accounts[5].pubkey;

        const [baseMint, quoteMint] = await Promise.all([
          tryGetMint(connection, tokenBase),
          tryGetMint(connection, tokenQuote),
        ]);

        if (!baseMint || !quoteMint) {
          throw new Error('Mint not found');
        }

        const uiMinBaseAmount = fmtTokenAmount(
          new BN(minBaseAmount),
          baseMint.account.decimals,
        );

        const uiMinQuoteAmount = fmtTokenAmount(
          new BN(minQuoteAmount),
          quoteMint.account.decimals,
        );

        return (
          <>
            <p>{`Base Share: ${baseShare.toLocaleString()}`}</p>
            <p>{`Quote Share: ${quoteShare.toLocaleString()}`}</p>
            <p>{`UI Mint Base Amount: ${uiMinBaseAmount.toLocaleString()}`}</p>
            <p>{`UI Mint Quote Amount: ${uiMinQuoteAmount.toLocaleString()}`}</p>
          </>
        );
      },
    },

    [DeltafiDexV2.instructionsCode.DepositToStableSwap]: {
      name: 'Deltafi - Deposit from Stable Swap',
      accounts: [
        'swapInfo',
        'userTokenBase',
        'userTokenQuote',
        'liquidityProvider',
        'tokenBase',
        'tokenQuote',
        'pythPriceBase',
        'pythPriceQuote',
        'adminFeeTokenBase',
        'adminFeeTokenQuote',
        'userAuthority',
        'tokenProgram',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[],
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          u8('SIGHASH_1'),
          u8('SIGHASH_2'),
          u8('SIGHASH_3'),
          u8('SIGHASH_4'),
          u8('SIGHASH_5'),
          u8('SIGHASH_6'),
          u8('SIGHASH_7'),
          nu64('baseAmount'),
          nu64('quoteAmount'),
          nu64('minBaseShare'),
          nu64('minQuoteShare'),
        ]);

        const {
          baseAmount,
          quoteAmount,
          minBaseShare,
          minQuoteShare,
        } = dataLayout.decode(Buffer.from(data)) as any;

        const tokenBase = accounts[4].pubkey;
        const tokenQuote = accounts[5].pubkey;

        const [baseMint, quoteMint] = await Promise.all([
          tryGetMint(connection, tokenBase),
          tryGetMint(connection, tokenQuote),
        ]);

        if (!baseMint || !quoteMint) {
          throw new Error('Mint not found');
        }

        const uiBaseAmount = fmtTokenAmount(
          new BN(baseAmount),
          baseMint.account.decimals,
        );

        const uiQuoteAmount = fmtTokenAmount(
          new BN(quoteAmount),
          quoteMint.account.decimals,
        );

        return (
          <>
            <p>{`Mi Base Share: ${minBaseShare.toLocaleString()}`}</p>
            <p>{`Min Quote Share: ${minQuoteShare.toLocaleString()}`}</p>
            <p>{`UI Base Amount: ${uiBaseAmount.toLocaleString()}`}</p>
            <p>{`UI Quote Amount: ${uiQuoteAmount.toLocaleString()}`}</p>
          </>
        );
      },
    },
  },
};
