export type { CatalogItem } from './types';

import type { CatalogItem } from './types';
import dellCatalog from './dell';
import superMicroCatalog from './superMicro';
import nVidiaCatalog from './nVidia';
import mellanoxCatalog from './mellanox';
import lumaOpticsCatalog from './lumaOptics';
import ulineCatalog from './uline';
import proficiumCatalog from './proficium';
import molexCatalog from './molex';
import opengearCatalog from './opengear';

export const catalogItems: CatalogItem[] = [
  ...dellCatalog,
  ...superMicroCatalog,
  ...nVidiaCatalog,
  ...mellanoxCatalog,
  ...lumaOpticsCatalog,
  ...ulineCatalog,
  ...proficiumCatalog,
  ...molexCatalog,
  ...opengearCatalog,
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
  'console-server': 'Console Servers & OOB',
  other: 'Other',
};
