import type { CatalogItem } from './types';

const ibmCatalog: CatalogItem[] = [
  {
    id: 'ibm-mtm-5149-f48',
    model: 'IBM SSS 6000 Model F48 (All NVME) 7 PB Usable Capacity Configuration Includes: 2',
    manufacturer: 'IBM',
    category: 'server',
    description: 'IBM SSS 6000 Model F48 (All NVME) 7 PB Usable Capacity Configuration Includes: 2 x IBM Management Servers 2 x IBM Protocol Servers 2 x IBM AFM Servers 2 x IBM Token Servers',
    partNumber: '5149-F48',
    estimatedCost: '$555,357.00',
    specs: 'Storage Server / Chassis | Serialized | UOM: Eaches',
    vendorIds: ["ibm"],
  },
  {
    id: 'ibm-ibm-storage-scale-software-licenses',
    model: 'IBM Storage Scale Software Licenses',
    manufacturer: 'IBM',
    category: 'other',
    description: 'IBM Storage Scale Software Licenses',
    partNumber: 'IBM Storage Scale Software Licenses',
    estimatedCost: '$0.00',
    specs: 'License | UOM: Eaches',
    vendorIds: ["ibm"],
  },
];

export default ibmCatalog;
