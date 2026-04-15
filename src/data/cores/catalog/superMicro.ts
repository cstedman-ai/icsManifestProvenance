import type { CatalogItem } from './types';

const superMicroCatalog: CatalogItem[] = [
  {
    id: 'smc-sys-422ga-nbrt-lcc',
    model: 'SYS-422GA-NBRT-LCC',
    manufacturer: 'Super Micro Computer',
    category: 'server',
    description: 'GPU SuperServer (HGX B200) — 4U liquid-cooled, motherboard X14DBG-DAP, chassis CSE-GP403TS-R000NP',
    partNumber: 'SYS-422GA-NBRT-LCC',
    estimatedCost: '$450,000.00',
    specs: '4U | HGX B200 | Liquid cooled | X14DBG-DAP | CSE-GP403TS-R000NP',
    vendorIds: ['supermicro'],
    links: {
      productPage: 'https://www.supermicro.com/en/products/system/gpu/4u/sys-422ga-nbrt-lcc',
      datasheet: 'https://www.supermicro.com/en/products/system/datasheet/sys-422ga-nbrt-lcc',
    },
  },
  {
    id: 'smc-sys-421ge-tnhr2-lcc',
    model: 'SYS-421GE-TNHR2-LCC',
    manufacturer: 'Super Micro Computer',
    category: 'server',
    description: 'AI Training SuperServer (HGX H100/H200) — 4U liquid-cooled, used for H100/H200 LCC fleet with leak detection',
    partNumber: 'SYS-421GE-TNHR2-LCC',
    estimatedCost: '$380,000.00',
    specs: '4U | HGX H100/H200 | Liquid cooled | AI Training SuperServer',
    vendorIds: ['supermicro'],
    links: {
      productPage: 'https://www.supermicro.com/en/products/system/ai_training/4u/sys-421ge-tnhr2-lcc',
      datasheet: 'https://www.supermicro.com/en/products/system/datasheet/sys-421ge-tnhr2-lcc',
    },
  },
  {
    id: 'smc-sys-111c-nr',
    model: 'SYS-111C-NR',
    manufacturer: 'Super Micro Computer',
    category: 'server',
    description: '1U CloudDC server — compact general-purpose server for cloud and datacenter workloads',
    partNumber: 'SYS-111C-NR',
    estimatedCost: '$8,500.00',
    specs: '1U | CloudDC | Intel Xeon | General purpose',
    vendorIds: ['supermicro'],
    links: {
      productPage: 'https://www.supermicro.com/en/products/system/datasheet/SYS-111C-NR',
      datasheet: 'https://www.supermicro.com/en/products/system/datasheet/SYS-111C-NR',
    },
  },
];

export default superMicroCatalog;
