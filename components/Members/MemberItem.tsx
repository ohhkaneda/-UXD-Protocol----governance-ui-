import { UserCircleIcon, LogoutIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'
import { tryParsePublicKey } from '@tools/core/pubkey'
import { fmtMintAmount } from '@tools/sdk/units'
import tokenService from '@utils/services/token'
import useMembersListStore from 'stores/useMembersStore'
import { ViewState } from './types'
import { useMemo } from 'react'
import { Member } from '@utils/uiTypes/members'
import { AddressImage, DisplayAddress } from '@cardinal/namespaces-components'
import useWalletStore from 'stores/useWalletStore'

const MemberItem = ({ item }: { item: Member }) => {
  const { mint, councilMint, realm } = useRealm()
  const {
    setCurrentCompactView,
    setCurrentCompactViewMember,
  } = useMembersListStore()
  const {
    walletAddress,
    councilVotes,
    communityVotes,
    votesCasted,
    hasCouncilTokenOutsideRealm,
    hasCommunityTokenOutsideRealm,
  } = item
  const { connection } = useWalletStore((s) => s)

  const walletPublicKey = tryParsePublicKey(walletAddress)
  const tokenName = realm
    ? tokenService.getTokenInfo(realm?.account.communityMint.toBase58())?.symbol
    : ''
  const totalVotes = votesCasted
  const communityAmount =
    communityVotes && !communityVotes.isZero()
      ? useMemo(() => fmtMintAmount(mint, communityVotes), [item.walletAddress])
      : null
  const councilAmount =
    councilVotes && !councilVotes.isZero()
      ? useMemo(() => fmtMintAmount(councilMint, councilVotes), [
          item.walletAddress,
        ])
      : null

  async function handleGoToMemberOverview() {
    setCurrentCompactView(ViewState.MemberOverview)
    setCurrentCompactViewMember(item)
  }

  const address = useMemo(
    () => (
      <AddressImage
        dark={true}
        connection={connection.current}
        address={walletPublicKey}
        height="auto"
        width="2.5rem"
        placeholder={<UserCircleIcon className="h-6 text-fgd-3 w-6" />}
      />
    ),
    [item.walletAddress]
  )

  const addressName = useMemo(
    () => (
      <DisplayAddress
        connection={connection.current}
        address={walletPublicKey}
        height="12px"
        width="100px"
        dark={true}
      />
    ),
    [item.walletAddress]
  )

  return (
    <div
      onClick={handleGoToMemberOverview}
      className="cursor-pointer default-transition flex items-center text-fgd-1 border border-fgd-4 p-3 pr-0 w-full hover:border-white"
    >
      <div className="bg-bkg-1 flex flex-shrink-0 items-center justify-center h-10 w-14 mr-2">
        {address}
      </div>
      <div>
        <div className="text-xs text-th-fgd-1 h-5">{addressName}</div>
        <div className="text-fgd-3 text-xs flex flex-col">
          Votes cast: {totalVotes}
        </div>
        <div className="text-fgd-3 text-xs flex flex-col">
          {(communityAmount || !councilAmount) && (
            <span className="flex items-center">
              {tokenName} Votes {communityAmount || 0}
              {hasCommunityTokenOutsideRealm && (
                <LogoutIcon className="w-3 h-3 ml-1" />
              )}
            </span>
          )}
          {councilAmount && (
            <span className="flex items-center">
              Council Votes {councilAmount}{' '}
              {hasCouncilTokenOutsideRealm && (
                <LogoutIcon className="w-3 h-3 ml-1" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default MemberItem
