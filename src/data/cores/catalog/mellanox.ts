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
    links: {
      productPage: 'https://docs.nvidia.com/networking/display/800gmma4z00ns',
      datasheet: 'https://docs.nvidia.com/networking/display/800gmma4z00ns/specifications',
    },
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
    links: {
      productPage: 'https://docs.nvidia.com/networking/display/mma4z00ns400',
      datasheet: 'https://docs.nvidia.com/networking/display/mma4z00ns400/specifications',
    },
  },
  {
    id: 'mellanox-mms1v70-cm',
    model: 'MMS1V70-CM',
    manufacturer: 'NVIDIA (Mellanox)',
    category: 'transceiver',
    description: 'QSFP28 transceiver — 100GbE DR1',
    partNumber: 'MMS1V70-CM',
    estimatedCost: '$1,800.00',
    specs: 'QSFP28 | 100G DR1 | LC | 1310nm | 500m SMF',
    vendorIds: ['mellanox', 'nvidia'],
    links: {
      productPage: 'https://docs.nvidia.com/networking/display/MMS1V70CM10',
      datasheet: 'https://docs.nvidia.com/networking/display/mms1v70-cm-100gbe-qsfp28-dr1-transceiver-product-specifications.pdf',
    },
  },
  {
    id: 'mellanox-mms1v00-wm',
    model: 'MMS1V00-WM',
    manufacturer: 'NVIDIA (Mellanox)',
    category: 'transceiver',
    description: 'QSFP-DD transceiver — 400GbE DR4',
    partNumber: 'MMS1V00-WM',
    estimatedCost: '$2,200.00',
    specs: 'QSFP-DD | 400G DR4 | MPO-12 | 1310nm | 500m SMF',
    vendorIds: ['mellanox', 'nvidia'],
    links: {
      productPage: 'https://docs.nvidia.com/networking/display/MMS1V00WM10',
      datasheet: 'https://network.nvidia.com/pdf/prod_cables/PB_MMS1V00-WM_400GbE_QSFP-DD_DR4_Transceiver.pdf',
    },
  },
];

export default mellanoxCatalog;
