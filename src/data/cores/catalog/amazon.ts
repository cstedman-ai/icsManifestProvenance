import type { CatalogItem } from './types';

const amazonCatalog: CatalogItem[] = [
  {
    id: 'amazon-grbatty',
    model: 'Grbatty Rechargeable Batteries',
    manufacturer: 'Amazon',
    category: 'other',
    description: 'Grbatty Rechargeable Batteries',
    partNumber: 'Grbatty',
    estimatedCost: '$19.99',
    specs: 'Consumables and Misc. | UOM: Eaches',
    vendorIds: ["amazon"],
  },
  {
    id: 'amazon-lb-mpo-om32',
    model: 'MTP/MPO Fiber Optic Loopback Test Cable for Multimode OM3 OM4 OM5',
    manufacturer: 'Amazon',
    category: 'other',
    description: 'MTP/MPO Fiber Optic Loopback Test Cable for Multimode OM3 OM4 OM5',
    partNumber: 'LB-MPO-OM32',
    estimatedCost: '$39.99',
    specs: 'Consumables and Misc. | UOM: Eaches',
    vendorIds: ["amazon"],
  },
];

export default amazonCatalog;
