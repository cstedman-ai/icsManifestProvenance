import type { CatalogItem } from './types';

const lumaOpticsCatalog: CatalogItem[] = [
  {
    id: 'compatible-qdd-400g-lr4-s',
    model: 'QDD-400G-LR4-S (Compatible)',
    manufacturer: 'Luma Optics',
    category: 'transceiver',
    description: 'Compatible QSFP-DD transceiver — 400G LR4',
    partNumber: 'QDD-400G-LR4-S',
    estimatedCost: '$1,200.00',
    specs: 'QSFP-DD | 400G LR4 | LC | 10km',
    vendorIds: ['lumaOptics'],
  },
  {
    id: 'cable-fibre-lclc',
    model: 'OM4 LC-LC Duplex',
    manufacturer: 'Generic',
    category: 'cable',
    description: 'OM4 multimode LC-to-LC duplex fiber patch cable',
    partNumber: 'OM4-LCLC',
    estimatedCost: '$25.00',
    specs: 'OM4 | LC duplex | 40/100Gbps class',
    vendorIds: ['lumaOptics'],
  },
  {
    id: 'cable-fibre-mpo',
    model: 'OS2 MPO-12 APC Trunk',
    manufacturer: 'Generic',
    category: 'cable',
    description: 'OS2 singlemode MPO-12 APC trunk cable — 100/400Gbps class',
    partNumber: 'OS2-MPO12-APC',
    estimatedCost: '$120.00',
    specs: 'OS2 singlemode | MPO-12 APC | 100/400Gbps',
    vendorIds: ['lumaOptics'],
  },
  {
    id: 'cable-fibre-mpo-splitter',
    model: 'MPO Splitter OM4',
    manufacturer: 'Generic',
    category: 'cable',
    description: '1× MPO to 2× MPO splitter — OM4 multimode',
    partNumber: 'OM4-MPO-SPLIT',
    estimatedCost: '$85.00',
    specs: 'OM4 | 1×MPO → 2×MPO | NVIDIA MFP7E20 compatible',
    vendorIds: ['lumaOptics'],
  },
];

export default lumaOpticsCatalog;
