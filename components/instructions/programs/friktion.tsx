import { struct, u8 } from 'buffer-layout'
import { Connection } from '@solana/web3.js'
import { AccountMetaData } from '@solana/spl-governance'
import { FRIKTION_PROGRAM_ID } from '@friktion-labs/friktion-sdk'
import { u64 } from '@project-serum/borsh'

export const FRIKTION_PROGRAM_INSTRUCTIONS = {
  [FRIKTION_PROGRAM_ID.toBase58()]: {
    242: {
      name: 'Friktion - Deposit',
      accounts: [
        'Authority',
        'Dao Authority',
        'Authority Check',
        'Vault Mint',
        'Volt Vault',
        'Vault Authority',
        'Extra Volt Data',
        'Whitelist',
        'Deposit Pool',
        'Writer Token Pool',
        'Vault Token Destination',
        'Underlying Token Source',
        'Round Info',
        'Round Volt Tokens',
        'Round Underlying Tokens',
        'Pending Deposit Info',
        'System Program',
        'Token Program',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const authority = accounts[0].pubkey.toString()
        const daoAuthority = accounts[1].pubkey.toString()
        const authorityCheck = accounts[2].pubkey.toString()
        const vaultMint = accounts[3].pubkey.toString()
        const voltVault = accounts[4].pubkey.toString()
        const vaultAuthority = accounts[5].pubkey.toString()
        const extraVoltData = accounts[6].pubkey.toString()
        const whitelist = accounts[7].pubkey.toString()
        const depositPool = accounts[8].pubkey.toString()
        const writerTokenPool = accounts[9].pubkey.toString()
        const vaultTokenDestination = accounts[10].pubkey.toString()
        const underlyingTokenSource = accounts[11].pubkey.toString()
        const roundInfo = accounts[12].pubkey.toString()
        const roundVoltTokens = accounts[13].pubkey.toString()
        const roundUnderlyingTokens = accounts[14].pubkey.toString()
        const pendingDepositInfo = accounts[15].pubkey.toString()

        const dataLayout = struct([
          u8('instruction'),
          u8('SIGHASH_1'),
          u8('SIGHASH_2'),
          u8('SIGHASH_3'),
          u8('SIGHASH_4'),
          u8('SIGHASH_5'),
          u8('SIGHASH_6'),
          u8('SIGHASH_7'),
          u64('depositAmount'),
        ])

        const { depositAmount } = dataLayout.decode(Buffer.from(data)) as any

        return (
          <div className="flex flex-col">
            <div className="flex justify-between">
              <span>Authority:</span>
              <span>{authority}</span>
            </div>
            <div className="flex justify-between">
              <span>DAO Authority:</span>
              <span>{daoAuthority}</span>
            </div>
            <div className="flex justify-between">
              <span>Authority Check:</span>
              <span>{authorityCheck}</span>
            </div>
            <div className="flex justify-between">
              <span>Vault Mint:</span>
              <span>{vaultMint}</span>
            </div>
            <div className="flex justify-between">
              <span>Volt Vault:</span>
              <span>{voltVault}</span>
            </div>
            <div className="flex justify-between">
              <span>Vault Authority:</span>
              <span>{vaultAuthority}</span>
            </div>
            <div className="flex justify-between">
              <span>Extra Volt Data:</span>
              <span>{extraVoltData}</span>
            </div>
            <div className="flex justify-between">
              <span>Whitelist:</span>
              <span>{whitelist}</span>
            </div>
            <div className="flex justify-between">
              <span>Deposit Pool:</span>
              <span>{depositPool}</span>
            </div>
            <div className="flex justify-between">
              <span>Writer Token Pool:</span>
              <span>{writerTokenPool}</span>
            </div>
            <div className="flex justify-between">
              <span>Vault Token Destination:</span>
              <span>{vaultTokenDestination}</span>
            </div>
            <div className="flex justify-between">
              <span>Underlying Token Source:</span>
              <span>{underlyingTokenSource}</span>
            </div>
            <div className="flex justify-between">
              <span>Round Info:</span>
              <span>{roundInfo}</span>
            </div>
            <div className="flex justify-between">
              <span>Round Volt Tokens:</span>
              <span>{roundVoltTokens}</span>
            </div>
            <div className="flex justify-between">
              <span>Round Underlying Tokens:</span>
              <span>{roundUnderlyingTokens}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Deposit Info:</span>
              <span>{pendingDepositInfo}</span>
            </div>
            <div className="flex justify-between">
              <span>Native Deposit Amount:</span>
              <span>{Number(depositAmount).toLocaleString()}</span>
            </div>
          </div>
        )
      },
    },

    183: {
      name: 'Friktion - Withdraw',
      accounts: [
        'Authority',
        'Dao Authority',
        'Authority Check',
        'Vault Mint',
        'Volt Vault',
        'Vault Authority',
        'Extra Volt Data',
        'Whitelist',
        'Deposit Pool',
        'Underlying Token Destination',
        'Vault Token Source',
        'Round Info',
        'Round Underlying Tokens',
        'Pending Withdrawal Info',
        'Fee Acct',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const authority = accounts[0].pubkey.toString()
        const daoAuthority = accounts[1].pubkey.toString()
        const authorityCheck = accounts[2].pubkey.toString()
        const vaultMint = accounts[3].pubkey.toString()
        const voltVault = accounts[4].pubkey.toString()
        const vaultAuthority = accounts[5].pubkey.toString()
        const extraVoltData = accounts[6].pubkey.toString()
        const whitelist = accounts[7].pubkey.toString()
        const depositPool = accounts[8].pubkey.toString()
        const underlyingTokenDestination = accounts[9].pubkey.toString()
        const vaultTokenSource = accounts[10].pubkey.toString()
        const roundInfo = accounts[11].pubkey.toString()
        const roundUnderlyingTokens = accounts[12].pubkey.toString()
        const pendingWithdrawalInfo = accounts[13].pubkey.toString()
        const feeAcct = accounts[14].pubkey.toString()

        const dataLayout = struct([
          u8('instruction'),
          u8('SIGHASH_1'),
          u8('SIGHASH_2'),
          u8('SIGHASH_3'),
          u8('SIGHASH_4'),
          u8('SIGHASH_5'),
          u8('SIGHASH_6'),
          u8('SIGHASH_7'),
          u64('withdrawAmount'),
        ])

        const { withdrawAmount } = dataLayout.decode(Buffer.from(data)) as any

        return (
          <div className="flex flex-col">
            <div className="flex justify-between">
              <span>Authority:</span>
              <span>{authority}</span>
            </div>
            <div className="flex justify-between">
              <span>DAO Authority:</span>
              <span>{daoAuthority}</span>
            </div>
            <div className="flex justify-between">
              <span>Authority Check:</span>
              <span>{authorityCheck}</span>
            </div>
            <div className="flex justify-between">
              <span>Vault Mint:</span>
              <span>{vaultMint}</span>
            </div>
            <div className="flex justify-between">
              <span>Volt Vault:</span>
              <span>{voltVault}</span>
            </div>
            <div className="flex justify-between">
              <span>Vault Authority:</span>
              <span>{vaultAuthority}</span>
            </div>
            <div className="flex justify-between">
              <span>Extra Volt Data:</span>
              <span>{extraVoltData}</span>
            </div>
            <div className="flex justify-between">
              <span>Whitelist:</span>
              <span>{whitelist}</span>
            </div>
            <div className="flex justify-between">
              <span>Deposit Pool:</span>
              <span>{depositPool}</span>
            </div>

            <div className="flex justify-between">
              <span>Underlying Token Destination:</span>
              <span>{underlyingTokenDestination}</span>
            </div>
            <div className="flex justify-between">
              <span>Vault Token Source:</span>
              <span>{vaultTokenSource}</span>
            </div>
            <div className="flex justify-between">
              <span>Round Info:</span>
              <span>{roundInfo}</span>
            </div>
            <div className="flex justify-between">
              <span>Round Underlying Tokens:</span>
              <span>{roundUnderlyingTokens}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending withdrawal Info:</span>
              <span>{pendingWithdrawalInfo}</span>
            </div>
            <div className="flex justify-between">
              <span>Fee Acct:</span>
              <span>{feeAcct}</span>
            </div>
            <div className="flex justify-between">
              <span>Native Withdraw Amount:</span>
              <span>{Number(withdrawAmount).toLocaleString()}</span>
            </div>
          </div>
        )
      },
    },
  },
}
