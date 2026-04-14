import type { CatalogItem } from './types';

const mellanoxCatalog: CatalogItem[] = [
  {
    id: 'mellanox-mma4z00-ns',
    model: 'MMA4Z00-NS',
    manufacturer: 'NVIDIA (Mellanox)',
    category: 'transceiver',
    description: 'OSFP twin-port transceiver — 800Gb/s (2×400 SR4)',
    partNumber: 'MMA4Z00-NS',
    estimatedCost: '$2,500.00',
    specs: 'OSFP | 800G | MPO-12 | 50m OM4',
    vendorIds: ['mellanox', 'nvidia'],
  },
  {
    id: 'mellanox-mma4z00-ns400',
    model: 'MMA4Z00-NS400',
    manufacturer: 'NVIDIA (Mellanox)',
    category: 'transceiver',
    description: 'OSFP transceiver — 400Gb/s SR4',
    partNumber: 'MMA4Z00-NS400',
    estimatedCost: '$1,900.00',
    specs: 'OSFP | 400G SR4 | MPO-12 | 50m OM4',
    vendorIds: ['mellanox', 'nvidia'],
  },
  {
    id: 'mellanox-mms1v70-cm',
    model: 'MMS1V70-CM',
    manufacturer: 'NVIDIA (Mellanox)',
    category: 'transceiver',
    description: 'QSFP112 transceiver — 400G DR4',
    partNumber: 'MMS1V70-CM',
    estimatedCost: '$1,800.00',
    specs: 'QSFP112 | 400G DR4 | MPO-12 | 500m OS2',
    vendorIds: ['mellanox', 'nvidia'],
  },
  {
    id: 'mellanox-mms1v00-wm',
    model: 'MMS1V00-WM',
    manufacturer: 'NVIDIA (Mellanox)',
    category: 'transceiver',
    description: 'QSFP-DD transceiver — 400G DR4',
    partNumber: 'MMS1V00-WM',
    estimatedCost: '$2,200.00',
    specs: 'QSFP-DD | 400G DR4 | MPO-12 | 500m OS2',
    vendorIds: ['mellanox', 'nvidia'],
  },
];

export default mellanoxCatalog;
