import type { CatalogItem } from './types';

const lenovoCatalog: CatalogItem[] = [
  {
    id: 'lenovo-g400-10085-01',
    model: 'G400 Accessory Kit',
    manufacturer: 'Lenovo',
    category: 'cable',
    description: 'G400 Accessory Kit',
    partNumber: 'G400-10085-01',
    estimatedCost: '$18.00',
    specs: 'Cabling | UOM: Eaches',
    vendorIds: ["lenovo"],
  },
  {
    id: 'lenovo-sr665',
    model: 'ThinkSystem SR665 V3 Rack Server',
    manufacturer: 'Lenovo',
    category: 'server',
    description: 'ThinkSystem SR665 V3 Rack Server',
    partNumber: 'SR665',
    estimatedCost: '$3,930.00',
    specs: 'CPU Server / Chassis | Serialized | UOM: Eaches',
    vendorIds: ["lenovo"],
  },
];

export default lenovoCatalog;
