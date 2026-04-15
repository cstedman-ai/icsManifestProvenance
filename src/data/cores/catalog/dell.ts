import type { CatalogItem } from './types';

const dellCatalog: CatalogItem[] = [
  {
    id: 'dell-xe9680-h100',
    model: 'PowerEdge XE9680',
    manufacturer: 'Dell Technologies',
    category: 'server',
    description: 'High-performance 6U AI rack server with 8x NVIDIA H100 GPUs',
    partNumber: 'XE9680-H100',
    estimatedCost: '$350,000.00',
    specs: '6U | 2× Xeon | 8× H100 SXM5 80GB | DDR5 up to 4TB | ~10–11.5 kW',
    vendorIds: ['dell'],
    links: {
      productPage: 'https://www.dell.com/en-us/shop/ipovw/poweredge-xe9680',
      datasheet: 'https://www.delltechnologies.com/asset/en-us/products/servers/technical-support/poweredge-xe9680-spec-sheet.pdf',
    },
  },
  {
    id: 'dell-xe9680-h200',
    model: 'PowerEdge XE9680 (H200)',
    manufacturer: 'Dell Technologies',
    category: 'server',
    description: 'High-performance 6U AI rack server with 8x NVIDIA HGX H200 GPUs and BlueField-3 SuperNIC support',
    partNumber: 'XE9680-H200',
    estimatedCost: '$400,000.00',
    specs: '6U | 2× Xeon | 8× H200 SXM5 | DDR5 | ~11.5–12.5 kW',
    vendorIds: ['dell'],
    links: {
      productPage: 'https://www.dell.com/en-us/shop/ipovw/poweredge-xe9680',
      datasheet: 'https://www.delltechnologies.com/asset/en-us/products/servers/technical-support/poweredge-xe9680-spec-sheet.pdf',
    },
  },
  {
    id: 'dell-xe9712',
    model: 'PowerEdge XE9712',
    manufacturer: 'Dell Technologies',
    category: 'server',
    description: 'NVIDIA GB200 NVL72 Compute Node (1U Sled) for AI at Scale with Liquid Cooling',
    partNumber: 'XE9712',
    estimatedCost: '$120,000.00',
    specs: '1U sled | Grace CPU + Blackwell GB200 | LPDDR5X | Liquid cooled',
    vendorIds: ['dell'],
    links: {
      productPage: 'https://www.dell.com/en-us/shop/ipovw/poweredge-xe9712',
      datasheet: 'https://www.delltechnologies.com/asset/en-us/products/servers/technical-support/poweredge-xe-ai-spec-sheet.pdf',
    },
  },
  {
    id: 'dell-cabinet-44u',
    model: 'Dell 44U Rack Cabinet',
    manufacturer: 'Dell Technologies',
    category: 'cabinet',
    description: '44U EIA/IEC rack cabinet',
    partNumber: '770-BBIN',
    estimatedCost: '$3,500.00',
    specs: '44U | EIA/IEC standard | Cable management + security',
    vendorIds: ['dell'],
    links: {
      productPage: 'https://www.dell.com/en-us/shop/netshelter-4-post-open-frame-rack-44u-12-24-threaded-holes/apd/a3707707/power-cooling-data-center-infrastructure',
    },
  },
];

export default dellCatalog;
