import { generateErrorMap } from '@saberhq/anchor-contrib';

export type QuarryMineIDL = {
  version: '1.11.11';
  name: 'quarry_mine';
  instructions: [
    {
      name: 'newRewarder';
      accounts: [
        {
          name: 'base';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'rewarder';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'unusedClock';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'mintWrapper';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rewardsTokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'claimFeeTokenAccount';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'bump';
          type: 'u8';
        },
      ];
    },
    {
      name: 'setPauseAuthority';
      accounts: [
        {
          name: 'auth';
          accounts: [
            {
              name: 'authority';
              isMut: false;
              isSigner: true;
            },
            {
              name: 'rewarder';
              isMut: true;
              isSigner: false;
            },
          ];
        },
        {
          name: 'pauseAuthority';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'pause';
      accounts: [
        {
          name: 'pauseAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'rewarder';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'unpause';
      accounts: [
        {
          name: 'pauseAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'rewarder';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'transferAuthority';
      accounts: [
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'rewarder';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'newAuthority';
          type: 'publicKey';
        },
      ];
    },
    {
      name: 'acceptAuthority';
      accounts: [
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'rewarder';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'setAnnualRewards';
      accounts: [
        {
          name: 'auth';
          accounts: [
            {
              name: 'authority';
              isMut: false;
              isSigner: true;
            },
            {
              name: 'rewarder';
              isMut: true;
              isSigner: false;
            },
          ];
        },
      ];
      args: [
        {
          name: 'newRate';
          type: 'u64';
        },
      ];
    },
    {
      name: 'createQuarry';
      accounts: [
        {
          name: 'quarry';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'auth';
          accounts: [
            {
              name: 'authority';
              isMut: false;
              isSigner: true;
            },
            {
              name: 'rewarder';
              isMut: true;
              isSigner: false;
            },
          ];
        },
        {
          name: 'tokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'unusedClock';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'bump';
          type: 'u8';
        },
      ];
    },
    {
      name: 'setRewardsShare';
      accounts: [
        {
          name: 'auth';
          accounts: [
            {
              name: 'authority';
              isMut: false;
              isSigner: true;
            },
            {
              name: 'rewarder';
              isMut: true;
              isSigner: false;
            },
          ];
        },
        {
          name: 'quarry';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'newShare';
          type: 'u64';
        },
      ];
    },
    {
      name: 'setFamine';
      accounts: [
        {
          name: 'auth';
          accounts: [
            {
              name: 'authority';
              isMut: false;
              isSigner: true;
            },
            {
              name: 'rewarder';
              isMut: false;
              isSigner: false;
            },
          ];
        },
        {
          name: 'quarry';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'famineTs';
          type: 'i64';
        },
      ];
    },
    {
      name: 'updateQuarryRewards';
      accounts: [
        {
          name: 'quarry';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rewarder';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'createMiner';
      accounts: [
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'miner';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'quarry';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rewarder';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'tokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'minerVault';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'bump';
          type: 'u8';
        },
      ];
    },
    {
      name: 'claimRewards';
      accounts: [
        {
          name: 'mintWrapper';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'mintWrapperProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'minter';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rewardsTokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rewardsTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'claimFeeTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'stake';
          accounts: [
            {
              name: 'authority';
              isMut: false;
              isSigner: true;
            },
            {
              name: 'miner';
              isMut: true;
              isSigner: false;
            },
            {
              name: 'quarry';
              isMut: true;
              isSigner: false;
            },
            {
              name: 'unusedMinerVault';
              isMut: true;
              isSigner: false;
            },
            {
              name: 'unusedTokenAccount';
              isMut: true;
              isSigner: false;
            },
            {
              name: 'tokenProgram';
              isMut: false;
              isSigner: false;
            },
            {
              name: 'rewarder';
              isMut: false;
              isSigner: false;
            },
          ];
        },
      ];
      args: [];
    },
    {
      name: 'stakeTokens';
      accounts: [
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'miner';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'quarry';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'minerVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rewarder';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'withdrawTokens';
      accounts: [
        {
          name: 'authority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'miner';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'quarry';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'minerVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rewarder';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'extractFees';
      accounts: [
        {
          name: 'rewarder';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'claimFeeTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'feeToTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: 'Rewarder';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'base';
            type: 'publicKey';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'pendingAuthority';
            type: 'publicKey';
          },
          {
            name: 'numQuarries';
            type: 'u16';
          },
          {
            name: 'annualRewardsRate';
            type: 'u64';
          },
          {
            name: 'totalRewardsShares';
            type: 'u64';
          },
          {
            name: 'mintWrapper';
            type: 'publicKey';
          },
          {
            name: 'rewardsTokenMint';
            type: 'publicKey';
          },
          {
            name: 'claimFeeTokenAccount';
            type: 'publicKey';
          },
          {
            name: 'maxClaimFeeMillibps';
            type: 'u64';
          },
          {
            name: 'pauseAuthority';
            type: 'publicKey';
          },
          {
            name: 'isPaused';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'Quarry';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'rewarderKey';
            type: 'publicKey';
          },
          {
            name: 'tokenMintKey';
            type: 'publicKey';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'index';
            type: 'u16';
          },
          {
            name: 'tokenMintDecimals';
            type: 'u8';
          },
          {
            name: 'famineTs';
            type: 'i64';
          },
          {
            name: 'lastUpdateTs';
            type: 'i64';
          },
          {
            name: 'rewardsPerTokenStored';
            type: 'u128';
          },
          {
            name: 'annualRewardsRate';
            type: 'u64';
          },
          {
            name: 'rewardsShare';
            type: 'u64';
          },
          {
            name: 'totalTokensDeposited';
            type: 'u64';
          },
          {
            name: 'numMiners';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'Miner';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'quarryKey';
            type: 'publicKey';
          },
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'tokenVaultKey';
            type: 'publicKey';
          },
          {
            name: 'rewardsEarned';
            type: 'u64';
          },
          {
            name: 'rewardsPerTokenPaid';
            type: 'u128';
          },
          {
            name: 'balance';
            type: 'u64';
          },
          {
            name: 'index';
            type: 'u64';
          },
        ];
      };
    },
  ];
  types: [
    {
      name: 'StakeAction';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Stake';
          },
          {
            name: 'Withdraw';
          },
        ];
      };
    },
  ];
  events: [
    {
      name: 'NewRewarderEvent';
      fields: [
        {
          name: 'authority';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'timestamp';
          type: 'i64';
          index: false;
        },
      ];
    },
    {
      name: 'ClaimEvent';
      fields: [
        {
          name: 'authority';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'stakedToken';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'rewardsToken';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'amount';
          type: 'u64';
          index: false;
        },
        {
          name: 'fees';
          type: 'u64';
          index: false;
        },
        {
          name: 'timestamp';
          type: 'i64';
          index: false;
        },
      ];
    },
    {
      name: 'StakeEvent';
      fields: [
        {
          name: 'authority';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'token';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'amount';
          type: 'u64';
          index: false;
        },
        {
          name: 'timestamp';
          type: 'i64';
          index: false;
        },
      ];
    },
    {
      name: 'WithdrawEvent';
      fields: [
        {
          name: 'authority';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'token';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'amount';
          type: 'u64';
          index: false;
        },
        {
          name: 'timestamp';
          type: 'i64';
          index: false;
        },
      ];
    },
    {
      name: 'RewarderAnnualRewardsUpdateEvent';
      fields: [
        {
          name: 'previousRate';
          type: 'u64';
          index: false;
        },
        {
          name: 'newRate';
          type: 'u64';
          index: false;
        },
        {
          name: 'timestamp';
          type: 'i64';
          index: false;
        },
      ];
    },
    {
      name: 'MinerCreateEvent';
      fields: [
        {
          name: 'authority';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'quarry';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'miner';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'QuarryCreateEvent';
      fields: [
        {
          name: 'tokenMint';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'timestamp';
          type: 'i64';
          index: false;
        },
      ];
    },
    {
      name: 'QuarryRewardsUpdateEvent';
      fields: [
        {
          name: 'tokenMint';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'annualRewardsRate';
          type: 'u64';
          index: false;
        },
        {
          name: 'rewardsShare';
          type: 'u64';
          index: false;
        },
        {
          name: 'timestamp';
          type: 'i64';
          index: false;
        },
      ];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'Unauthorized';
      msg: 'You are not authorized to perform this action.';
    },
    {
      code: 6001;
      name: 'InsufficientBalance';
      msg: 'Insufficient staked balance for withdraw request.';
    },
    {
      code: 6002;
      name: 'PendingAuthorityNotSet';
      msg: 'Pending authority not set';
    },
    {
      code: 6003;
      name: 'InvalidRewardsShare';
      msg: 'Invalid quarry rewards share';
    },
    {
      code: 6004;
      name: 'InsufficientAllowance';
      msg: 'Insufficient allowance.';
    },
    {
      code: 6005;
      name: 'NewVaultNotEmpty';
      msg: 'New vault not empty.';
    },
    {
      code: 6006;
      name: 'NotEnoughTokens';
      msg: 'Not enough tokens.';
    },
    {
      code: 6007;
      name: 'InvalidTimestamp';
      msg: 'Invalid timestamp.';
    },
    {
      code: 6008;
      name: 'InvalidMaxClaimFee';
      msg: 'Invalid max claim fee.';
    },
    {
      code: 6009;
      name: 'MaxAnnualRewardsRateExceeded';
      msg: 'Max annual rewards rate exceeded.';
    },
    {
      code: 6010;
      name: 'Paused';
      msg: 'Rewarder is paused.';
    },
    {
      code: 6011;
      name: 'UpperboundExceeded';
      msg: "Rewards earned exceeded quarry's upper bound.";
    },
  ];
};
export const QuarryMineJSON: QuarryMineIDL = {
  version: '1.11.11',
  name: 'quarry_mine',
  instructions: [
    {
      name: 'newRewarder',
      accounts: [
        {
          name: 'base',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'rewarder',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'unusedClock',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mintWrapper',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rewardsTokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'claimFeeTokenAccount',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'setPauseAuthority',
      accounts: [
        {
          name: 'auth',
          accounts: [
            {
              name: 'authority',
              isMut: false,
              isSigner: true,
            },
            {
              name: 'rewarder',
              isMut: true,
              isSigner: false,
            },
          ],
        },
        {
          name: 'pauseAuthority',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'pause',
      accounts: [
        {
          name: 'pauseAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'rewarder',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'unpause',
      accounts: [
        {
          name: 'pauseAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'rewarder',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'transferAuthority',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'rewarder',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'newAuthority',
          type: 'publicKey',
        },
      ],
    },
    {
      name: 'acceptAuthority',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'rewarder',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'setAnnualRewards',
      accounts: [
        {
          name: 'auth',
          accounts: [
            {
              name: 'authority',
              isMut: false,
              isSigner: true,
            },
            {
              name: 'rewarder',
              isMut: true,
              isSigner: false,
            },
          ],
        },
      ],
      args: [
        {
          name: 'newRate',
          type: 'u64',
        },
      ],
    },
    {
      name: 'createQuarry',
      accounts: [
        {
          name: 'quarry',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'auth',
          accounts: [
            {
              name: 'authority',
              isMut: false,
              isSigner: true,
            },
            {
              name: 'rewarder',
              isMut: true,
              isSigner: false,
            },
          ],
        },
        {
          name: 'tokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'unusedClock',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'setRewardsShare',
      accounts: [
        {
          name: 'auth',
          accounts: [
            {
              name: 'authority',
              isMut: false,
              isSigner: true,
            },
            {
              name: 'rewarder',
              isMut: true,
              isSigner: false,
            },
          ],
        },
        {
          name: 'quarry',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'newShare',
          type: 'u64',
        },
      ],
    },
    {
      name: 'setFamine',
      accounts: [
        {
          name: 'auth',
          accounts: [
            {
              name: 'authority',
              isMut: false,
              isSigner: true,
            },
            {
              name: 'rewarder',
              isMut: false,
              isSigner: false,
            },
          ],
        },
        {
          name: 'quarry',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'famineTs',
          type: 'i64',
        },
      ],
    },
    {
      name: 'updateQuarryRewards',
      accounts: [
        {
          name: 'quarry',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rewarder',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'createMiner',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'miner',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'quarry',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rewarder',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'tokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'minerVault',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'bump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'claimRewards',
      accounts: [
        {
          name: 'mintWrapper',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mintWrapperProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'minter',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rewardsTokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'rewardsTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'claimFeeTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'stake',
          accounts: [
            {
              name: 'authority',
              isMut: false,
              isSigner: true,
            },
            {
              name: 'miner',
              isMut: true,
              isSigner: false,
            },
            {
              name: 'quarry',
              isMut: true,
              isSigner: false,
            },
            {
              name: 'unusedMinerVault',
              isMut: true,
              isSigner: false,
            },
            {
              name: 'unusedTokenAccount',
              isMut: true,
              isSigner: false,
            },
            {
              name: 'tokenProgram',
              isMut: false,
              isSigner: false,
            },
            {
              name: 'rewarder',
              isMut: false,
              isSigner: false,
            },
          ],
        },
      ],
      args: [],
    },
    {
      name: 'stakeTokens',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'miner',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'quarry',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'minerVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rewarder',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'withdrawTokens',
      accounts: [
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'miner',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'quarry',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'minerVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rewarder',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'extractFees',
      accounts: [
        {
          name: 'rewarder',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'claimFeeTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'feeToTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'Rewarder',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'base',
            type: 'publicKey',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'pendingAuthority',
            type: 'publicKey',
          },
          {
            name: 'numQuarries',
            type: 'u16',
          },
          {
            name: 'annualRewardsRate',
            type: 'u64',
          },
          {
            name: 'totalRewardsShares',
            type: 'u64',
          },
          {
            name: 'mintWrapper',
            type: 'publicKey',
          },
          {
            name: 'rewardsTokenMint',
            type: 'publicKey',
          },
          {
            name: 'claimFeeTokenAccount',
            type: 'publicKey',
          },
          {
            name: 'maxClaimFeeMillibps',
            type: 'u64',
          },
          {
            name: 'pauseAuthority',
            type: 'publicKey',
          },
          {
            name: 'isPaused',
            type: 'bool',
          },
        ],
      },
    },
    {
      name: 'Quarry',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'rewarderKey',
            type: 'publicKey',
          },
          {
            name: 'tokenMintKey',
            type: 'publicKey',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'index',
            type: 'u16',
          },
          {
            name: 'tokenMintDecimals',
            type: 'u8',
          },
          {
            name: 'famineTs',
            type: 'i64',
          },
          {
            name: 'lastUpdateTs',
            type: 'i64',
          },
          {
            name: 'rewardsPerTokenStored',
            type: 'u128',
          },
          {
            name: 'annualRewardsRate',
            type: 'u64',
          },
          {
            name: 'rewardsShare',
            type: 'u64',
          },
          {
            name: 'totalTokensDeposited',
            type: 'u64',
          },
          {
            name: 'numMiners',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'Miner',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'quarryKey',
            type: 'publicKey',
          },
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'tokenVaultKey',
            type: 'publicKey',
          },
          {
            name: 'rewardsEarned',
            type: 'u64',
          },
          {
            name: 'rewardsPerTokenPaid',
            type: 'u128',
          },
          {
            name: 'balance',
            type: 'u64',
          },
          {
            name: 'index',
            type: 'u64',
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'StakeAction',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Stake',
          },
          {
            name: 'Withdraw',
          },
        ],
      },
    },
  ],
  events: [
    {
      name: 'NewRewarderEvent',
      fields: [
        {
          name: 'authority',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'timestamp',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'ClaimEvent',
      fields: [
        {
          name: 'authority',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'stakedToken',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'rewardsToken',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
        {
          name: 'fees',
          type: 'u64',
          index: false,
        },
        {
          name: 'timestamp',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'StakeEvent',
      fields: [
        {
          name: 'authority',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'token',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
        {
          name: 'timestamp',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'WithdrawEvent',
      fields: [
        {
          name: 'authority',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'token',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'amount',
          type: 'u64',
          index: false,
        },
        {
          name: 'timestamp',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'RewarderAnnualRewardsUpdateEvent',
      fields: [
        {
          name: 'previousRate',
          type: 'u64',
          index: false,
        },
        {
          name: 'newRate',
          type: 'u64',
          index: false,
        },
        {
          name: 'timestamp',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'MinerCreateEvent',
      fields: [
        {
          name: 'authority',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'quarry',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'miner',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'QuarryCreateEvent',
      fields: [
        {
          name: 'tokenMint',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'timestamp',
          type: 'i64',
          index: false,
        },
      ],
    },
    {
      name: 'QuarryRewardsUpdateEvent',
      fields: [
        {
          name: 'tokenMint',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'annualRewardsRate',
          type: 'u64',
          index: false,
        },
        {
          name: 'rewardsShare',
          type: 'u64',
          index: false,
        },
        {
          name: 'timestamp',
          type: 'i64',
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'Unauthorized',
      msg: 'You are not authorized to perform this action.',
    },
    {
      code: 6001,
      name: 'InsufficientBalance',
      msg: 'Insufficient staked balance for withdraw request.',
    },
    {
      code: 6002,
      name: 'PendingAuthorityNotSet',
      msg: 'Pending authority not set',
    },
    {
      code: 6003,
      name: 'InvalidRewardsShare',
      msg: 'Invalid quarry rewards share',
    },
    {
      code: 6004,
      name: 'InsufficientAllowance',
      msg: 'Insufficient allowance.',
    },
    {
      code: 6005,
      name: 'NewVaultNotEmpty',
      msg: 'New vault not empty.',
    },
    {
      code: 6006,
      name: 'NotEnoughTokens',
      msg: 'Not enough tokens.',
    },
    {
      code: 6007,
      name: 'InvalidTimestamp',
      msg: 'Invalid timestamp.',
    },
    {
      code: 6008,
      name: 'InvalidMaxClaimFee',
      msg: 'Invalid max claim fee.',
    },
    {
      code: 6009,
      name: 'MaxAnnualRewardsRateExceeded',
      msg: 'Max annual rewards rate exceeded.',
    },
    {
      code: 6010,
      name: 'Paused',
      msg: 'Rewarder is paused.',
    },
    {
      code: 6011,
      name: 'UpperboundExceeded',
      msg: "Rewards earned exceeded quarry's upper bound.",
    },
  ],
};
export const QuarryMineErrors = generateErrorMap(QuarryMineJSON);
