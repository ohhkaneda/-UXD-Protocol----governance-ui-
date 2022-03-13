import { ChartPieIcon } from '@heroicons/react/outline'
import useTribecaGaugeInfos from '@hooks/useTribecaGaugesInfos'
import { saberTribecaConfiguration } from '@tools/sdk/tribeca/configurations'
import ActiveGaugeVotes from './ActiveGaugeVotes'
import EscrowOwnerName from './EscrowOwnerName'
import TribecaGaugesEpoch from './TribecaGaugesEpoch'

const TribecaGauges = () => {
  const { infos, escrowOwner } = useTribecaGaugeInfos(saberTribecaConfiguration)

  if (!escrowOwner) {
    return <></>
  }

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg transition-all">
      <h3 className="bg-bkg-2 mb-4 flex items-center">
        <ChartPieIcon className="flex-shrink-0 h-5 mr-1 text-primary-light w-5" />
        Saber Tribeca Gauges
      </h3>

      <EscrowOwnerName
        escrowOwnerName={escrowOwner?.name}
        escrowOwnerAddress={escrowOwner?.publicKey}
      />

      <TribecaGaugesEpoch
        nextEpoch={infos?.gaugemeisterData.nextEpochStartsAt}
        rewardsEpoch={infos?.gaugemeisterData.currentRewardsEpoch}
        epochDurationSeconds={infos?.gaugemeisterData.epochDurationSeconds}
      />

      <ActiveGaugeVotes activeGaugeVotesData={infos?.activeGaugeVotesData} />

      <div
        style={{ maxHeight: '350px' }}
        className="overflow-y-auto space-y-3"
      ></div>
    </div>
  )
}

export default TribecaGauges
