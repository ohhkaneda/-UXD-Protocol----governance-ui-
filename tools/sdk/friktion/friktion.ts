import { FriktionSnapshot, VoltSnapshot } from '@friktion-labs/friktion-sdk';

const FRIKTION_SNAPSHOT_URL =
  'https://friktion-labs.github.io/mainnet-tvl-snapshots/friktionSnapshot.json';

// To get vaults that are not in circuit
// Change to ?.filter((x) => !x.isInCircuits)

// Now I have allowed only one vault -> 9cHT8d7d35ngj5i8WBZB8ibjnPLnvnym4tp4KoTCQtxw, our vault
const ALLOWED_VAULTS = [
  '9cHT8d7d35ngj5i8WBZB8ibjnPLnvnym4tp4KoTCQtxw', // SOL-UXD vault
  '2yPs4YTdMzuKmYeubfNqH2xxgdEkXMxVcFWnAFbsojS2', // Funding Rate vault
];

const VOLT_TYPES = {
  1: 'Generate Income',
  2: 'Sustainable Stables',
  3: 'Crab Strategy',
};

export type VoltList = {
  [vaultLabel: string]: VoltSnapshot;
};

const fetchVoltsSnapshot = async () => {
  const response = await fetch(FRIKTION_SNAPSHOT_URL);
  const parsedResponse = (await response.json()) as FriktionSnapshot;
  return parsedResponse.allMainnetVolts as VoltSnapshot[];
};

const createLabel = (voltType, tokenSymbol, vaultApy) =>
  `Volt #${voltType} - ${VOLT_TYPES[voltType]} - ${tokenSymbol} - APY: ${vaultApy}%`;

const formatVoltListFromSnapshot = (volts: VoltSnapshot[]): VoltList => {
  return volts.reduce((list, snap) => {
    if (!snap.voltVaultId || snap.voltType > 3) return list;
    const label = createLabel(
      snap.voltType,
      snap.underlyingTokenSymbol,
      snap.apy,
    );
    return { ...list, [label]: { ...snap } };
  }, {});
};

const filterAllowedVolts = (list: VoltSnapshot[], allowedVoltIds: string[]) =>
  list.filter((v) => allowedVoltIds.includes(v.voltVaultId));

export const getVolts = async () =>
  formatVoltListFromSnapshot(
    filterAllowedVolts(await fetchVoltsSnapshot(), ALLOWED_VAULTS),
  );
