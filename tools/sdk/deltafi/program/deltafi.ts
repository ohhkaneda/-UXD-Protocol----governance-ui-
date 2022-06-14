import type { AnchorTypes } from '@saberhq/anchor-contrib';

import type { DeltafiDexV2 } from '../idl/deltafi';
export * from '../idl/deltafi';

export type DeltafiTypes = AnchorTypes<
  DeltafiDexV2,
  {
    liquidityProvider: LiquidityProviderData;
    deltafiUser: DeltafiUserData;
    farmInfo: FarmInfoData;
    farmUser: FarmUserData;
    marketConfig: MarketConfigData;
    swapInfo: SwapInfoData;
  },
  {
    swapType: SwapType;
  }
>;

type Accounts = DeltafiTypes['Accounts'];
type Defined = DeltafiTypes['Defined'];

type LiquidityProviderData = Accounts['liquidityProvider'];
type DeltafiUserData = Accounts['deltafiUser'];
type FarmInfoData = Accounts['farmInfo'];
type FarmUserData = Accounts['farmUser'];
type MarketConfigData = Accounts['marketConfig'];
type SwapInfoData = Accounts['swapInfo'];

export type SwapType = Defined['SwapType'];

export type DeltafiProgram = DeltafiTypes['Program'];
