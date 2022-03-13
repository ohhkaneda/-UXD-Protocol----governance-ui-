import { useCallback, useEffect, useState } from 'react'
import ATribecaConfiguration from '@tools/sdk/tribeca/ATribecaConfiguration'
import useTribecaGauge from './useTribecaGauge'
import { PublicKey } from '@solana/web3.js'
import useRealm from './useRealm'
import { GaugemeisterData, GaugeVoterData } from '@tools/sdk/tribeca/programs'

const EscrowOwnerMap = {
  UXDProtocol: {
    name: `SOL Treasury's Owner`,
    publicKey: new PublicKey('7M6TSEkRiXiYmpRCcCDSdJGTGxAPem2HBqjW4gLQ2KoE'),
  },
  'Kek World': {
    name: `SOL Treasury's Owner`,
    publicKey: new PublicKey('AuQHcJZhTd1dnXRrM78RomFiCvW6a9CqxxJ94Fp9h8b'),
  },
}

export type ActiveGaugeVoteData = {
  name: string
  mint: PublicKey
  logoURI?: string
  weight: number
}

export type TribecaGaugesInfos = {
  gaugemeisterData: GaugemeisterData
  gaugeVoterData: GaugeVoterData
  activeGaugeVotesData: ActiveGaugeVoteData[]
}

export default function useTribecaGaugeInfos(
  tribecaConfiguration: ATribecaConfiguration | null
) {
  const { realm } = useRealm()

  const [escrowOwner, setEscrowOwner] = useState<{
    name: string
    publicKey: PublicKey
  } | null>(null)

  useEffect(() => {
    if (!realm) return

    setEscrowOwner(EscrowOwnerMap[realm.account.name] ?? null)
  }, [realm])

  const { programs, gauges } = useTribecaGauge(tribecaConfiguration)

  const [infos, setInfos] = useState<TribecaGaugesInfos | null>(null)

  const loadInfos = useCallback(async (): Promise<TribecaGaugesInfos | null> => {
    if (!tribecaConfiguration || !programs || !escrowOwner || !gauges)
      return null

    try {
      const [escrow] = await tribecaConfiguration.findEscrowAddress(
        escrowOwner.publicKey
      )

      const [gaugeVoter] = await tribecaConfiguration.findGaugeVoterAddress(
        escrow
      )

      const [gaugemeisterData, gaugeVoterData] = await Promise.all([
        programs.Gauge.account.gaugemeister.fetch(
          ATribecaConfiguration.gaugemeister
        ),
        programs.Gauge.account.gaugeVoter.fetch(gaugeVoter),
      ])

      const gaugeVotes = await programs.Gauge.account.gaugeVote.all()

      const activeGaugeVotes = gaugeVotes.filter(
        (gaugeVote) =>
          gaugeVote.account.weight > 0 &&
          gaugeVote.account.gaugeVoter.equals(gaugeVoter)
      )

      const activeGaugeVotesData = activeGaugeVotes.map((activeGaugeVote) => {
        const [name, gaugeInfos] = Object.entries(gauges).find(([, gauge]) =>
          gauge.publicKey.equals(activeGaugeVote.account.gauge)
        )!

        return {
          name,
          mint: gaugeInfos.mint,
          logoURI: gaugeInfos.logoURI,
          weight: activeGaugeVote.account.weight,
        }
      })

      return {
        gaugemeisterData,
        gaugeVoterData,
        activeGaugeVotesData,
      }
    } catch (err) {
      console.log(
        `Cannot load Gauges infos for escrowOwner ${
          escrowOwner.name
        } / ${escrowOwner.publicKey.toString()}`,
        err
      )

      return null
    }
  }, [tribecaConfiguration, programs, escrowOwner, gauges])

  useEffect(() => {
    loadInfos().then(setInfos)
  }, [loadInfos])

  return {
    escrowOwner,
    infos,
    gauges,
    programs,
  }
}
