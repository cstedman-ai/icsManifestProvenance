import type { CatalogItem } from './types';

const cat6aLengths = [
  { m: 1, ft: 3.28 },
  { m: 2, ft: 6.56 },
  { m: 3, ft: 9.84 },
  { m: 5, ft: 16.4 },
  { m: 7, ft: 22.97 },
  { m: 10, ft: 32.81 },
  { m: 15, ft: 49.21 },
  { m: 20, ft: 65.62 },
  { m: 25, ft: 82.02 },
  { m: 30, ft: 98.43 },
  { m: 45, ft: 147.64 },
  { m: 50, ft: 164.04 },
];

const om4Lengths = [
  { m: 1, ft: 3.28 },
  { m: 2, ft: 6.56 },
  { m: 3, ft: 9.84 },
  { m: 5, ft: 16.4 },
  { m: 7, ft: 22.97 },
  { m: 10, ft: 32.81 },
  { m: 15, ft: 49.21 },
  { m: 20, ft: 65.62 },
  { m: 25, ft: 82.02 },
  { m: 30, ft: 98.43 },
  { m: 45, ft: 147.64 },
  { m: 50, ft: 164.04 },
];

const os2Lengths = [
  { m: 1, ft: 3.28 },
  { m: 2, ft: 6.56 },
  { m: 3, ft: 9.84 },
  { m: 5, ft: 16.4 },
  { m: 7, ft: 22.97 },
  { m: 10, ft: 32.81 },
  { m: 15, ft: 49.21 },
  { m: 20, ft: 65.62 },
  { m: 25, ft: 82.02 },
  { m: 30, ft: 98.43 },
  { m: 45, ft: 147.64 },
  { m: 50, ft: 164.04 },
];

const molexCatalog: CatalogItem[] = [
  // Cat6a S/FTP Copper — per length
  ...cat6aLengths.map((len): CatalogItem => ({
    id: `molex-cat6a-sftp-${len.m}m`,
    model: `Cat6a S/FTP Patch Cable — ${len.m}m (${len.ft}ft)`,
    manufacturer: 'Molex',
    category: 'cable',
    description: `S/FTP Cat6a copper patch cable — ${len.m}m / ${len.ft}ft, 10Gbps, LSZH jacket, 26 AWG`,
    partNumber: `MOL-CAT6A-SFTP-${len.m}M`,
    estimatedCost: `$${(8 + len.m * 0.6).toFixed(2)}`,
    specs: `Cat6a | RJ45 | S/FTP | 10Gbps | 500MHz | ${len.m}m / ${len.ft}ft | LSZH`,
    vendorIds: ['molex'],
  })),

  // OM4 LC-LC Duplex Fiber — per length
  ...om4Lengths.map((len): CatalogItem => ({
    id: `molex-om4-lclc-${len.m}m`,
    model: `OM4 LC-LC Duplex Fiber — ${len.m}m (${len.ft}ft)`,
    manufacturer: 'Molex',
    category: 'cable',
    description: `OM4 multimode LC-to-LC duplex fiber patch cable — ${len.m}m / ${len.ft}ft, 40/100Gbps, LSZH aqua jacket`,
    partNumber: `MOL-OM4-LCLC-${len.m}M`,
    estimatedCost: `$${(12 + len.m * 1.2).toFixed(2)}`,
    specs: `OM4 | LC duplex | 40/100Gbps | 4700 MHz·km | ${len.m}m / ${len.ft}ft | LSZH`,
    vendorIds: ['molex'],
  })),

  // OS2 MPO-12 APC Fiber Trunk — per length
  ...os2Lengths.map((len): CatalogItem => ({
    id: `molex-os2-mpo12-${len.m}m`,
    model: `OS2 MPO-12 APC Trunk — ${len.m}m (${len.ft}ft)`,
    manufacturer: 'Molex',
    category: 'cable',
    description: `OS2 singlemode MPO-12 APC F/F trunk cable — ${len.m}m / ${len.ft}ft, 100/400Gbps, LSZH yellow jacket`,
    partNumber: `MOL-OS2-MPO12-${len.m}M`,
    estimatedCost: `$${(45 + len.m * 2.5).toFixed(2)}`,
    specs: `OS2 singlemode | MPO-12 APC F/F | 100/400Gbps | ${len.m}m / ${len.ft}ft | LSZH`,
    vendorIds: ['molex'],
  })),

  // OM4 MPO-12 APC Splitter (1×MPO → 2×MPO) — per length
  ...[
    { m: 1, ft: 3.28 },
    { m: 2, ft: 6.56 },
    { m: 3, ft: 9.84 },
    { m: 5, ft: 16.4 },
    { m: 7, ft: 22.97 },
    { m: 10, ft: 32.81 },
    { m: 15, ft: 49.21 },
    { m: 20, ft: 65.62 },
    { m: 25, ft: 82.02 },
    { m: 30, ft: 98.43 },
    { m: 45, ft: 147.64 },
    { m: 50, ft: 164.04 },
  ].map((len): CatalogItem => ({
    id: `molex-om4-mpo-split-${len.m}m`,
    model: `OM4 MPO-12 Splitter — ${len.m}m (${len.ft}ft)`,
    manufacturer: 'Molex',
    category: 'cable',
    description: `OM4 MPO-12/APC 1×MPO to 2×MPO splitter cable — ${len.m}m / ${len.ft}ft, 800G→2×400G, LSZH aqua jacket, NVIDIA MFP7E20 compatible`,
    partNumber: `MOL-OM4-MPO-SPLIT-${len.m}M`,
    estimatedCost: `$${(55 + len.m * 2.8).toFixed(2)}`,
    specs: `OM4 | 1×MPO → 2×MPO APC | 800G→2×400G | 4700 MHz·km | ${len.m}m / ${len.ft}ft | LSZH`,
    vendorIds: ['molex'],
  })),
];

export default molexCatalog;
