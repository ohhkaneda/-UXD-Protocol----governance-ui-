import { SaberStats } from '@hooks/useSaberStats'

const SaberStat = ({
  saberStat: {
    liquidityPoolName,
    uiBalance,
    uiRewardsEarned,
    mintName,
    rewardsTokenMintName,
  },
}: {
  saberStat: SaberStats
}) => {
  return (
    <div className="flex flex-col items-start text-fgd-1 hover:bg-bkg-3 p-3 w-full border border-fgd-4 rounded-lg relative">
      <span>{liquidityPoolName}</span>
      <div className="flex flex-col mt-3">
        <span className="text-xs">Balance</span>
        <span className="text-fgd-3 text-xs mt-1">{`${uiBalance} ${mintName}`}</span>
      </div>

      <div className="flex flex-col mt-2">
        <span className="text-xs">Claimable Rewards</span>
        <span className="text-fgd-3 text-xs mt-1">{`${uiRewardsEarned} ${rewardsTokenMintName}`}</span>
      </div>
    </div>
  )
}

export default SaberStat
