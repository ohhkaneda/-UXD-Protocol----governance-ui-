import { PublicKey } from '@solana/web3.js'
import {
  FriktionSDK,
  VoltSDK,
  FRIKTION_PROGRAM_ID,
} from '@friktion-labs/friktion-sdk'
import type { Provider as AnchorProvider } from '@project-serum/anchor'

class Friktion {
  public readonly programId: PublicKey = FRIKTION_PROGRAM_ID

  protected voltSdk: VoltSDK

  public async loadVoltSDK(provider: AnchorProvider): Promise<VoltSDK> {
    const volt = new PublicKey('9cHT8d7d35ngj5i8WBZB8ibjnPLnvnym4tp4KoTCQtxw')

    const friktionSdk = new FriktionSDK({
      provider,
      network: 'mainnet-beta',
    })

    return friktionSdk.loadVoltByKey(volt)
  }
}

export default new Friktion()
