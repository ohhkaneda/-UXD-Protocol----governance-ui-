import useSaberStats from '@hooks/useSaberStats'
import { FireIcon } from '@heroicons/react/outline'
import SaberStatsName from './SaberStatsName'
import SaberStat from './SaberStat'

const SaberStats = () => {
  const { saberAccountOwner, saberStats } = useSaberStats()

  if (!saberStats || !saberAccountOwner) {
    return <></>
  }

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg transition-all">
      <h3 className="bg-bkg-2 mb-4 flex items-center">
        <FireIcon className="flex-shrink-0 h-5 mr-1 text-primary-light w-5" />
        Saber Stats
      </h3>

      <SaberStatsName
        saberAccountOwnerAddress={saberAccountOwner.publicKey}
        saberAccountOwnerName={saberAccountOwner.name}
      />

      <div style={{ maxHeight: '350px' }} className="overflow-y-auto space-y-3">
        {saberStats.map((saberStat) => (
          <SaberStat key={saberStat.liquidityPoolName} saberStat={saberStat} />
        ))}
      </div>
    </div>
  )
}

export default SaberStats
