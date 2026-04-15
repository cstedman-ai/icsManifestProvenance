import type { CatalogItem } from './types';

const opengearCatalog: CatalogItem[] = [
  {
    id: 'og-om2216',
    model: 'OM2216',
    manufacturer: 'Opengear',
    category: 'console-server',
    description: 'OM2200 Operations Manager — standard 16-port console server deployed across multiple sites',
    partNumber: 'OM2216',
    estimatedCost: '$5,500.00',
    specs: '16 serial ports | Dual GbE | Cellular option | Lighthouse Enterprise',
    vendorIds: ['opengear'],
    links: {
      productPage: 'https://opengear.com/products/om2200-operations-manager/',
      datasheet: 'https://resources.opengear.com/om/datasheets/om2200/om2200-datasheet.pdf',
    },
  },
  {
    id: 'og-om2224-24e-ddc-l',
    model: 'OM2224-24E-DDC-L',
    manufacturer: 'Opengear',
    category: 'console-server',
    description: 'OM2200 Operations Manager — 24 serial + 24 Ethernet ports with DC power, used for dark-fiber / TPOP sites',
    partNumber: 'OM2224-24E-DDC-L',
    estimatedCost: '$8,200.00',
    specs: '24 serial + 24 Ethernet ports | DC power | Dual GbE | Lighthouse Enterprise',
    vendorIds: ['opengear'],
    links: {
      productPage: 'https://opengear.com/products/om2200-operations-manager/',
      datasheet: 'https://resources.opengear.com/om/datasheets/om2200/om2200-datasheet.pdf',
    },
  },
  {
    id: 'og-cm8148',
    model: 'CM8148 / CM8148-10G',
    manufacturer: 'Opengear',
    category: 'console-server',
    description: 'CM8100 Console Manager — 48-port console manager, CM8148-10G variant includes 10G uplinks',
    partNumber: 'CM8148',
    estimatedCost: '$12,000.00',
    specs: '48 serial ports | 1G or 10G uplink | Lighthouse Enterprise | 1U',
    vendorIds: ['opengear'],
    links: {
      productPage: 'https://opengear.com/products/cm8100-console-server/',
      datasheet: 'https://resources.opengear.com/cm/datasheets/cm8100/',
    },
  },
  {
    id: 'og-im7248',
    model: 'IM7248',
    manufacturer: 'Opengear',
    category: 'console-server',
    description: 'IM7200 Infrastructure Manager — 48-port unit used in legacy sites, seed-run and elevation templates',
    partNumber: 'IM7248',
    estimatedCost: '$7,500.00',
    specs: '48 serial ports | Dual GbE | Cellular option | 1U',
    vendorIds: ['opengear'],
    links: {
      productPage: 'https://opengear.com/products/im7200-infrastructure-manager',
      datasheet: 'https://opengear.com/wp-content/uploads/2018/03/IM7200_Infrastructure_Manager-Data_Sheet.pdf',
    },
  },
];

export default opengearCatalog;
