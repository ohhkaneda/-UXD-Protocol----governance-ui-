import { getExplorerUrl } from '@components/explorer/tools'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { PublicKey } from '@solana/web3.js'
import { abbreviateAddress } from '@utils/formatting'
import { createRef } from 'react'
import useWalletStore from 'stores/useWalletStore'

const SaberStatsName = ({
  saberAccountOwnerName,
  saberAccountOwnerAddress,
}: {
  saberAccountOwnerName: string
  saberAccountOwnerAddress: PublicKey
}) => {
  const connection = useWalletStore((store) => store.connection)

  const linkRef = createRef<HTMLAnchorElement>()

  return (
    <div
      className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full relative cursor-pointer"
      onClick={() => linkRef.current?.click()}
    >
      <p className="text-fgd-3 text-xs">{saberAccountOwnerName}</p>
      <h3 className="mb-0">{abbreviateAddress(saberAccountOwnerAddress)}</h3>

      <a
        className="absolute right-3 top-2"
        href={getExplorerUrl(connection.endpoint, saberAccountOwnerAddress)}
        ref={linkRef}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
      </a>
    </div>
  )
}

export default SaberStatsName
