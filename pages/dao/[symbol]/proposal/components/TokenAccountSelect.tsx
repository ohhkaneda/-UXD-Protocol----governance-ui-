import { PublicKey } from '@solana/web3.js';
import Select from '@components/inputs/Select';
import { OwnedTokenAccountsInfo } from '@hooks/useGovernanceUnderlyingTokenAccounts';
import SelectOptionDetailed, { Flag } from './SelectOptionDetailed';

const TokenAccountSelect = ({
  label,
  value,
  filterByMint,
  onChange,
  error,
  ownedTokenAccountsInfo,
}: {
  label: string;
  value?: string;
  filterByMint?: PublicKey[];
  onChange: (value: string) => void;
  error: string;
  ownedTokenAccountsInfo?: OwnedTokenAccountsInfo;
}) => {
  if (!ownedTokenAccountsInfo) {
    return null;
  }

  const getAccountDisplay = (pubkey?: PublicKey) => {
    if (!pubkey) return null;

    const pubkeyString = pubkey.toString();

    const { mint, uiAmount, mintName, isATA } = ownedTokenAccountsInfo[
      pubkeyString
    ];
    const details = {
      'Mint Name': { text: mintName },
      'UI Balance': { text: uiAmount.toString() },
      Mint: { text: mint.toBase58() },
    };

    const diffValue = {
      flag: isATA ? Flag.OK : Flag.Danger,
      text: `${isATA ? 'Not an' : ''} Associated Token Account`,
    };

    return (
      <SelectOptionDetailed
        title={pubkeyString}
        details={details}
        diffValue={diffValue}
      />
    );
  };

  return (
    <Select
      label={label}
      value={value}
      componentLabel={getAccountDisplay(
        value ? new PublicKey(value) : undefined,
      )}
      placeholder="Please select..."
      onChange={onChange}
      error={error}
    >
      {Object.values(ownedTokenAccountsInfo)
        .filter(
          (ownedTokenAccountInfo) =>
            !filterByMint ||
            filterByMint.some((mint) =>
              mint.equals(ownedTokenAccountInfo.mint),
            ),
        )
        .map(({ pubkey }) => (
          <Select.Option key={pubkey.toBase58()} value={pubkey.toBase58()}>
            {getAccountDisplay(pubkey)}
          </Select.Option>
        ))}
    </Select>
  );
};

export default TokenAccountSelect;
