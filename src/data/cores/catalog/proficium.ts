import type { CatalogItem } from './types';

const lengths = [
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

const proficiumCatalog: CatalogItem[] = [
  // PDU
  {
    id: 'enlogic-en6950',
    model: 'EN6950',
    manufacturer: 'Enlogic',
    category: 'pdu',
    description: '3-phase zero-U intelligent PDU with outlet switching',
    partNumber: 'EN6950',
    estimatedCost: '$2,101.00',
    specs: '400–415V 3PH | 63A | 43.5kVA | 42 outlets | SNMP/Redfish',
    vendorIds: ['proficium'],
  },

  // ─── 10G Transceivers ───
  {
    id: 'prof-sfp-10g-lr',
    model: 'SFP-10G-LR',
    manufacturer: 'Proficium',
    category: 'transceiver',
    description: 'SFP+ transceiver — 10G LR, singlemode, LC duplex',
    partNumber: 'SFP-10G-LR',
    estimatedCost: '$350.00',
    specs: 'SFP+ | 10G LR | LC | 1310nm | 10km SMF',
    vendorIds: ['proficium'],
  },

  // ─── 25G Transceivers ───
  {
    id: 'prof-sfp-25g-sr-m',
    model: 'SFP-25G-SR-M',
    manufacturer: 'Proficium',
    category: 'transceiver',
    description: 'SFP28 transceiver — 25G SR, multimode',
    partNumber: 'SFP-25G-SR-M',
    estimatedCost: '$180.00',
    specs: 'SFP28 | 25G SR | LC | 850nm | 100m OM4',
    vendorIds: ['proficium'],
  },

  // ─── 40G Transceivers ───
  {
    id: 'prof-qsfp-40g-sr4-ar',
    model: 'QSFP-40G-SR4-AR',
    manufacturer: 'Proficium',
    category: 'transceiver',
    description: 'QSFP+ transceiver — 40G SR4, multimode, MPO',
    partNumber: 'QSFP-40G-SR4-AR',
    estimatedCost: '$280.00',
    specs: 'QSFP+ | 40G SR4 | MPO-12 | 850nm | 150m OM4',
    vendorIds: ['proficium'],
  },

  // ─── 100G Transceivers ───
  {
    id: 'prof-qsfp-100g-sr4-ar',
    model: 'QSFP-100G-SR4-AR',
    manufacturer: 'Proficium',
    category: 'transceiver',
    description: 'QSFP28 transceiver — 100G SR4, multimode, MPO',
    partNumber: 'QSFP-100G-SR4-AR',
    estimatedCost: '$450.00',
    specs: 'QSFP28 | 100G SR4 | MPO-12 | 850nm | 100m OM4',
    vendorIds: ['proficium'],
  },
  {
    id: 'prof-qsfp-100g-lr4-ar',
    model: 'QSFP-100G-LR4-AR',
    manufacturer: 'Proficium',
    category: 'transceiver',
    description: 'QSFP28 transceiver — 100G LR4, singlemode, LC duplex',
    partNumber: 'QSFP-100G-LR4-AR',
    estimatedCost: '$1,100.00',
    specs: 'QSFP28 | 100G LR4 | LC | 1310nm | 10km SMF',
    vendorIds: ['proficium'],
  },
  {
    id: 'prof-qsfp-100g-cwdm4-ar',
    model: 'QSFP-100G-CWDM4-AR',
    manufacturer: 'Proficium',
    category: 'transceiver',
    description: 'QSFP28 transceiver — 100G CWDM4, singlemode, LC duplex',
    partNumber: 'QSFP-100G-CWDM4-AR',
    estimatedCost: '$800.00',
    specs: 'QSFP28 | 100G CWDM4 | LC | 1271–1331nm | 2km SMF',
    vendorIds: ['proficium'],
  },
  {
    id: 'prof-qsfp-100g-dr1',
    model: 'QSFP-100G-DR1',
    manufacturer: 'Proficium',
    category: 'transceiver',
    description: 'QSFP28 transceiver — 100G DR, singlemode, LC simplex',
    partNumber: 'QSFP-100G-DR1',
    estimatedCost: '$600.00',
    specs: 'QSFP28 | 100G DR | LC | 1310nm | 500m SMF',
    vendorIds: ['proficium'],
  },

  // ─── 400G Transceivers ───
  {
    id: 'prof-qdd-400g-dr4-m',
    model: 'QSFP-DD-400G-DR4-M',
    manufacturer: 'Proficium',
    category: 'transceiver',
    description: 'QSFP-DD transceiver — 400G DR4, singlemode, MPO-12',
    partNumber: 'QSFP-DD-400G-DR4-M',
    estimatedCost: '$1,800.00',
    specs: 'QSFP-DD | 400G DR4 | MPO-12 | 1310nm | 500m SMF',
    vendorIds: ['proficium'],
  },
  {
    id: 'prof-qdd-400g-dr4',
    model: 'QSFP-DD-400G-DR4',
    manufacturer: 'Proficium',
    category: 'transceiver',
    description: 'QSFP-DD transceiver — 400G DR4, singlemode, MPO-12',
    partNumber: 'QSFP-DD-400G-DR4',
    estimatedCost: '$2,000.00',
    specs: 'QSFP-DD | 400G DR4 | MPO-12 | 1310nm | 500m SMF',
    vendorIds: ['proficium'],
  },

  // Cat6a S/FTP Copper — per length
  ...lengths.map((len): CatalogItem => ({
    id: `prof-cat6a-sftp-${len.m}m`,
    model: `Cat6a S/FTP Patch Cable — ${len.m}m (${len.ft}ft)`,
    manufacturer: 'Proficium',
    category: 'cable',
    description: `S/FTP Cat6a copper patch cable — ${len.m}m / ${len.ft}ft, 10Gbps, LSZH jacket, 26 AWG`,
    partNumber: `PF-CAT6A-SFTP-${len.m}M`,
    estimatedCost: `$${(9 + len.m * 0.65).toFixed(2)}`,
    specs: `Cat6a | RJ45 | S/FTP | 10Gbps | 500MHz | ${len.m}m / ${len.ft}ft | LSZH`,
    vendorIds: ['proficium'],
  })),

  // OM4 LC-LC Duplex Fiber — per length
  ...lengths.map((len): CatalogItem => ({
    id: `prof-om4-lclc-${len.m}m`,
    model: `OM4 LC-LC Duplex Fiber — ${len.m}m (${len.ft}ft)`,
    manufacturer: 'Proficium',
    category: 'cable',
    description: `OM4 multimode LC-to-LC duplex fiber patch cable — ${len.m}m / ${len.ft}ft, 40/100Gbps, LSZH aqua jacket`,
    partNumber: `PF-OM4-LCLC-${len.m}M`,
    estimatedCost: `$${(13 + len.m * 1.15).toFixed(2)}`,
    specs: `OM4 | LC duplex | 40/100Gbps | 4700 MHz·km | ${len.m}m / ${len.ft}ft | LSZH`,
    vendorIds: ['proficium'],
  })),

  // OS2 MPO-12 APC Fiber Trunk — per length
  ...lengths.map((len): CatalogItem => ({
    id: `prof-os2-mpo12-${len.m}m`,
    model: `OS2 MPO-12 APC Trunk — ${len.m}m (${len.ft}ft)`,
    manufacturer: 'Proficium',
    category: 'cable',
    description: `OS2 singlemode MPO-12 APC F/F trunk cable — ${len.m}m / ${len.ft}ft, 100/400Gbps, LSZH yellow jacket`,
    partNumber: `PF-OS2-MPO12-${len.m}M`,
    estimatedCost: `$${(48 + len.m * 2.6).toFixed(2)}`,
    specs: `OS2 singlemode | MPO-12 APC F/F | 100/400Gbps | ${len.m}m / ${len.ft}ft | LSZH`,
    vendorIds: ['proficium'],
  })),

  // OM4 MPO-12 APC Splitter (1×MPO → 2×MPO) — per length
  ...lengths.map((len): CatalogItem => ({
    id: `prof-om4-mpo-split-${len.m}m`,
    model: `OM4 MPO-12 Splitter — ${len.m}m (${len.ft}ft)`,
    manufacturer: 'Proficium',
    category: 'cable',
    description: `OM4 MPO-12/APC 1×MPO to 2×MPO splitter cable — ${len.m}m / ${len.ft}ft, 800G→2×400G, LSZH aqua jacket, NVIDIA MFP7E20 compatible`,
    partNumber: `PF-OM4-MPO-SPLIT-${len.m}M`,
    estimatedCost: `$${(58 + len.m * 2.9).toFixed(2)}`,
    specs: `OM4 | 1×MPO → 2×MPO APC | 800G→2×400G | 4700 MHz·km | ${len.m}m / ${len.ft}ft | LSZH`,
    vendorIds: ['proficium'],
  })),
];

export default proficiumCatalog;
