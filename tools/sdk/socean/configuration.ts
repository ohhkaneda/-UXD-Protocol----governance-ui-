import { EndpointTypes } from '@models/types'
import { newProgramMap } from '@saberhq/anchor-contrib'
import { SolanaAugmentedProvider } from '@saberhq/solana-contrib'
import { PublicKey } from '@solana/web3.js'
import { BondingProgram, BondingJSON } from './programs/bonding'

export type SoceanPrograms = {
  Bonding: BondingProgram
}

export type SupportedCluster = Extract<EndpointTypes, 'devnet' | 'mainnet'>

type MultiClusterPubkey = {
  [key in SupportedCluster]: PublicKey
}

class SoceanConfiguration {
  public readonly bondingProgramId: MultiClusterPubkey = {
    devnet: new PublicKey('76kLhv2TPJ6aCnHMEcm1kHrsBEsqo4wjCp5mz3prThkk'),

    mainnet: new PublicKey('bon4Kh3x1uQK16w9b9DKgz3Aw4AP1pZxBJk55Q6Sosb'),
  }

  public loadPrograms(
    provider: SolanaAugmentedProvider,
    cluster: SupportedCluster
  ): SoceanPrograms {
    return newProgramMap<SoceanPrograms>(
      provider,

      {
        // IDLs
        Bonding: BondingJSON,
      },

      {
        // Addresses
        Bonding: this.bondingProgramId[cluster],
      }
    )
  }
}

export default new SoceanConfiguration()
