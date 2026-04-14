export type { CatalogItem } from './types';

import type { CatalogItem } from './types';
import dellCatalog from './dell';
import nVidiaCatalog from './nVidia';
import mellanoxCatalog from './mellanox';
import lumaOpticsCatalog from './lumaOptics';
import ulineCatalog from './uline';
import proficiumCatalog from './proficium';

export const catalogItems: CatalogItem[] = [
  ...dellCatalog,
  ...nVidiaCatalog,
  ...mellanoxCatalog,
  ...lumaOpticsCatalog,
  ...ulineCatalog,
  ...proficiumCatalog,
];

export function getCatalogForVendor(vendorId: string): CatalogItem[] {
  return catalogItems.filter((item) => item.vendorIds.includes(vendorId));
}

export const categoryLabels: Record<string, string> = {
  server: 'Servers',
  switch: 'Switches',
  transceiver: 'Transceivers',
  cable: 'Cables & Fiber',
  pdu: 'PDUs',
  cabinet: 'Cabinets & Racks',
  other: 'Other',
};
