import useHotWallet from '@hooks/useHotWallet'
import HotWalletAccount from './HotWalletAccount'

const HotWallet = () => {
  const { tokenAccountsInfo } = useHotWallet()

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg transition-all">
      <h3 className="bg-bkg-2 mb-4 flex items-center">Hot Wallet</h3>

      <div style={{ maxHeight: '350px' }} className="overflow-y-auto space-y-3">
        {tokenAccountsInfo?.map((tokenAccountInfo) => (
          <HotWalletAccount
            key={tokenAccountInfo.publicKey.toBase58()}
            info={tokenAccountInfo}
          />
        ))}
      </div>
    </div>
  )
}

export default HotWallet
