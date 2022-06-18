import { PublicKey } from '@solana/web3.js';

export interface IPoolInfo {
  amm: PublicKey;
  poolMint: PublicKey;
  feeAccount: PublicKey;
  pythAccount: PublicKey;
  pythPcAccount: PublicKey;
  configAccount: PublicKey;
  poolCoinTokenAccount: PublicKey;
  poolCoinMint: PublicKey;
  poolCoinDecimal: number;
  poolPcTokenAccount: PublicKey;
  poolPcMint: PublicKey;
  poolPcDecimal: number;
  poolMintDecimal: number;
  pythBaseDecimal: number;
}

export type PoolNames =
  | 'UXD-USDC'
  | 'SOL-USDC'
  | 'SOL-USDT'
  | 'BTC-USDC'
  | 'ETH-USDC'
  | 'RAY-USDC'
  | 'USDT-USDC'
  | 'UST-USDC'
  | 'UXD-SOL';

export const PoolList: { [poolLabel in PoolNames]: IPoolInfo } = {
  'UXD-SOL': {
    amm: new PublicKey('GjnY1NbZafYu6VSK2ELh5NRZs7udGAUR2KoAB7pYxJak'),
    poolMint: new PublicKey('E9e9UPZvzLCtPNWimJk8T7JDKX6hvHWGe2ZTY1848bQf'),
    feeAccount: new PublicKey('ZRfAnqPSnyY4USGnoeJTNrriqPfudm2a9811vYHYniQ'),
    configAccount: new PublicKey(
      '3BUS8iaWzGjtCueoChEsu1N8Fh9QeQp8foJsU4tdKkJ7',
    ),
    pythAccount: new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'),
    pythPcAccount: new PublicKey(
      '6qyKHAbqFUGqukKDXK47f7ZFxfg3zsX3LYCaiTgwnCxk',
    ),
    poolCoinTokenAccount: new PublicKey(
      '4byV1TrowZopVezaBLL5cMbAaU3TZ5BQdtitHFWDBfuE',
    ),
    poolCoinMint: new PublicKey('So11111111111111111111111111111111111111112'),
    poolPcTokenAccount: new PublicKey(
      '4JciXWsVimE9tqnmgQ8AjZqYZwiF6fx6zCxWf9PCrZ2n',
    ),
    poolPcMint: new PublicKey('7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT'),
    poolCoinDecimal: 9,
    poolPcDecimal: 6,
    poolMintDecimal: 9,
    pythBaseDecimal: 11,
  },
  'UXD-USDC': {
    amm: new PublicKey('5BJUhcBnysAmCpaU6pABof7FUqxx7ZnCZXbctpP48o3C'),
    poolMint: new PublicKey('DM2Grhnear76DwNiRUSfeiFMt6jSj2op9GWinQDc7Yqh'),
    feeAccount: new PublicKey('9pKxj6GTTdJ2biQ6uTyv7CTmVmnjz6cXGCz7rXg7Nm2N'),
    configAccount: new PublicKey(
      '86MM38X9P5mxzRHFVX8ahtB9dCFKSk8AFhb33f5Zz8VW',
    ),
    pythAccount: new PublicKey('3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL'),
    pythPcAccount: new PublicKey(
      '3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL',
    ),
    poolCoinTokenAccount: new PublicKey(
      '5BUkh9e3JF9yUvSw6P3HHqkdMuujRG942hYNSkAEghFs',
    ),
    poolCoinMint: new PublicKey('7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT'),
    poolPcTokenAccount: new PublicKey(
      'BbwCGgAHEUfu7PUEz8hR877aK2snseqorfLbvtcVbjhj',
    ),
    poolPcMint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    poolCoinDecimal: 6,
    poolPcDecimal: 6,
    poolMintDecimal: 6,
    pythBaseDecimal: 8,
  },
  'SOL-USDC': {
    amm: new PublicKey('amgK1WE8Cvae4mVdj4AhXSsknWsjaGgo1coYicasBnM'),
    poolMint: new PublicKey('3WzrkFYq4SayCrhBw8BgsPiTVKTDjyV6wRqP7HL9Eyyw'),
    feeAccount: new PublicKey('AD5DFr1AXMB9h6fw5KFtkEfwf7kYSAiaSueeu4NGrLKY'),
    configAccount: new PublicKey(
      '2iT9h99mhDqetoZGNj7KKrqBnoDmFvAytGrnFYuR7MwN',
    ),
    pythAccount: new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'),
    pythPcAccount: new PublicKey(
      'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG',
    ),
    poolCoinTokenAccount: new PublicKey(
      '2uySTNgvGT2kwqpfgLiSgeBLR3wQyye1i1A2iQWoPiFr',
    ),
    poolCoinMint: new PublicKey('So11111111111111111111111111111111111111112'),
    poolPcTokenAccount: new PublicKey(
      '32SjGNjesiCZgmZb4YxAGgjnym6jAvTWbqihR4CvvXkZ',
    ),
    poolPcMint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    poolCoinDecimal: 9,
    poolPcDecimal: 6,
    poolMintDecimal: 9,
    pythBaseDecimal: 11,
  },
  'SOL-USDT': {
    amm: new PublicKey('2x8Bmv9wj2a4LxADBWKiLyGRgAosr8yJXuZyvS8adirK'),
    poolMint: new PublicKey('BRchiwrv9yCr4jAi6xF4epQdtNtmJH93rrerpHpMhK1Z'),
    feeAccount: new PublicKey('GFj8cNTP4mzWG7ywyJ35Ls2V8CbqDk3p4xNT1pAawoCh'),
    configAccount: new PublicKey(
      'Hor7j9oYfNH6EJgmnXQRiQSahduR5p4bfKyCZaQUqNKd',
    ),
    pythAccount: new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'),
    pythPcAccount: new PublicKey(
      '3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL',
    ),
    poolCoinTokenAccount: new PublicKey(
      '5pH2DBMZg7y5bN4J3oLKRETGXyVYPJpeaCH6AkdAcxqp',
    ),
    poolCoinMint: new PublicKey('So11111111111111111111111111111111111111112'),
    poolPcTokenAccount: new PublicKey(
      '7Cct2MJUwruQef5vQrP2bxYCNyVajJ3SiC1GYUmwmjUm',
    ),
    poolPcMint: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
    poolCoinDecimal: 9,
    poolPcDecimal: 6,
    poolMintDecimal: 9,
    pythBaseDecimal: 11,
  },
  'BTC-USDC': {
    amm: new PublicKey('HeH3s7B3a6nynim1rBGS6TRaYECgSNjt7Kp65mhW9P4k'),
    poolMint: new PublicKey('BzuTSoWFHrnRQvn4sr5ErPQyMaRB9g2rsbKCruGtcvMa'),
    feeAccount: new PublicKey('5HpNeHBBpg6x7fzTgbvP9UukQmDmvxbggwqo951BYkba'),
    configAccount: new PublicKey(
      'HuLmRVTfYjNYYGBpPtJEk7JKkosbbPF4zzBHnf3TfyCn',
    ),
    pythAccount: new PublicKey('GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU'),
    pythPcAccount: new PublicKey(
      'GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU',
    ),
    poolCoinTokenAccount: new PublicKey(
      'FAFShq3gZYXWtk5EkeKPKcwSkz2rjfMDuD1i7KiYwjVM',
    ),
    poolCoinMint: new PublicKey('9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E'),
    poolPcTokenAccount: new PublicKey(
      '3ReY1xscSAEV9Qg1NshkU4KRWQs33nu5JMg8AnoU7duG',
    ),
    poolPcMint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    poolCoinDecimal: 6,
    poolPcDecimal: 6,
    poolMintDecimal: 9,
    pythBaseDecimal: 8,
  },
  'ETH-USDC': {
    amm: new PublicKey('E32Z6DYwJELMTrVJVchN8PWbyhSoC3bRorMb7Cw2R9Xz'),
    poolMint: new PublicKey('8FxRyaE8X6ENLmNbaBvgS6vMsN1GJ8J7CmKy8K8uN6wM'),
    feeAccount: new PublicKey('5yXQ399ti5rKMcRMAZvFUqAgKHUP55bvhoYWd9bVrnu9'),
    configAccount: new PublicKey(
      '5JXrQpWAPNrvVN1R6Mz9MhA1EYUB948kceZjCxRzQzf5',
    ),
    pythAccount: new PublicKey('JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB'),
    pythPcAccount: new PublicKey(
      'JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB',
    ),
    poolCoinTokenAccount: new PublicKey(
      'BRFwAToCofwzP29jVGzb6VZ4AGpw867AE5VsXfMsmEGk',
    ),
    poolCoinMint: new PublicKey('7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs'),
    poolPcTokenAccount: new PublicKey(
      'FDCjDSbFCVRVBsWkJWfgZ9x3Dizm1MJjtzYw3R2fxXRv',
    ),
    poolPcMint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    poolCoinDecimal: 8,
    poolPcDecimal: 6,
    poolMintDecimal: 9,
    pythBaseDecimal: 10,
  },
  'RAY-USDC': {
    amm: new PublicKey('FcxHANr1dguexPZ2PoPGBajgiednXFMYHGGx4YMgedkM'),
    poolMint: new PublicKey('HUpvKUafPCMwhua6QtHXk1V8D6LZYyQmUKYPFZgRiiiX'),
    feeAccount: new PublicKey('DyR91PiiRopbdcizbjdXejodjxEeVSs4uCkyhL7wCvxw'),
    configAccount: new PublicKey(
      '2EXv6K3cYDMXXKFfzGjqnjkbngUymnVwBoC4kwrCKwFy',
    ),
    pythAccount: new PublicKey('AnLf8tVYCM816gmBjiy8n53eXKKEDydT5piYjjQDPgTB'),
    pythPcAccount: new PublicKey(
      'AnLf8tVYCM816gmBjiy8n53eXKKEDydT5piYjjQDPgTB',
    ),
    poolCoinTokenAccount: new PublicKey(
      'BhG9r4CkTBRtpLtxA8Hd72vCkikqyVhiq8pFunZNERV8',
    ),
    poolCoinMint: new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'),
    poolPcTokenAccount: new PublicKey(
      '8HAVXU7bdS2SEkkrqFBdWPFxFTrWxtu4GTjP46BDzdTc',
    ),
    poolPcMint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    poolCoinDecimal: 6,
    poolPcDecimal: 6,
    poolMintDecimal: 6,
    pythBaseDecimal: 8,
  },
  'USDT-USDC': {
    amm: new PublicKey('Cm3L8YhKq9h1SYoQLJnxKJbMtw62nF2CHy3yjAFuwVGy'),
    poolMint: new PublicKey('9d5GhGFbbX5LGYyXxPDMvsREgF69cFTGv6jxqtKkE58j'),
    feeAccount: new PublicKey('BBAsd3c1Nr4VAZE1Z9fwZKNRuaySyKsK5yiACgLKoNA6'),
    configAccount: new PublicKey(
      '62hK67DcFR2ywxtiAzxj4C1v5i2BtxzVt5ArNBgwYeUz',
    ),
    pythAccount: new PublicKey('3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL'),
    pythPcAccount: new PublicKey(
      '3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL',
    ),
    poolCoinTokenAccount: new PublicKey(
      'Hn9BgYCSxTyCPnKpjnjHVzqQG4szceDaCpQedjW4Ug3c',
    ),
    poolCoinMint: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
    poolPcTokenAccount: new PublicKey(
      '74ZXM4EgYcovVijnCuceXJrGCNu3KJPniRSvBpZzDig',
    ),
    poolPcMint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    poolCoinDecimal: 6,
    poolPcDecimal: 6,
    poolMintDecimal: 6,
    pythBaseDecimal: 8,
  },
  'UST-USDC': {
    amm: new PublicKey('DVJHq6RB56Ertd9cBwJ99cckQ3g192TCuSLphWuXs6yh'),
    poolMint: new PublicKey('GgXkVjtMrPbc6AvUwjApcnLsR63SeD1BPB7nSSjzH5CX'),
    feeAccount: new PublicKey('9unwWtiQJFsJJp9UjFcdGYTrzttGBc4GPgd7h6PSRswn'),
    configAccount: new PublicKey(
      '9v1viMjw6fWfBdKacU861ncyXUP9SChm8BK1wtiDkoJx',
    ),
    pythAccount: new PublicKey('GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU'),
    pythPcAccount: new PublicKey(
      'GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU',
    ),
    poolCoinTokenAccount: new PublicKey(
      '6Qqdyy6RtbTA75aZHVxuBBS37u24uZyeptCBErGhQhHL',
    ),
    poolCoinMint: new PublicKey('9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i'),
    poolPcTokenAccount: new PublicKey(
      '9cbaGjEJBz7CuvwLsMdPZXMFovQJ91pDDqZSuWsPRMVY',
    ),
    poolPcMint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    poolCoinDecimal: 6,
    poolPcDecimal: 6,
    poolMintDecimal: 6,
    pythBaseDecimal: 8,
  },
};
