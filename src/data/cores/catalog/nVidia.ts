import type { CatalogItem } from './types';

const nVidiaCatalog: CatalogItem[] = [
  {
    id: 'nvidia-mqm9790-ns2f',
    model: 'MQM9790-NS2F',
    manufacturer: 'NVIDIA',
    category: 'switch',
    description: 'InfiniBand NDR switch — 64 ports (32× OSFP 800Gb/s)',
    partNumber: 'MQM9790-NS2F',
    estimatedCost: '$32,000.00',
    specs: '1U | 64 ports | 51.2 Tb/s | InfiniBand NDR | ~1300 W',
    vendorIds: ['nvidia'],
    links: {
      productPage: 'https://docs.nvidia.com/networking/display/QM97X0PUB',
      datasheet: 'https://docs.nvidia.com/networking/display/qm97xx-1u-ndr-400gbps-infiniband-switch-systems-user-manual.pdf',
    },
  },
  {
    id: 'nvidia-msn2201-cb2fc',
    model: 'MSN2201-CB2FC',
    manufacturer: 'NVIDIA',
    category: 'switch',
    description: 'Spectrum Ethernet switch — 48×1G RJ45 + 4× 100G QSFP28',
    partNumber: 'MSN2201-CB2FC',
    estimatedCost: '$4,200.00',
    specs: '1U | 48×1G + 4×100G | Spectrum | ~100 W',
    vendorIds: ['nvidia'],
    links: {
      productPage: 'https://marketplace.nvidia.com/en-us/enterprise/networking/sn2201/',
      datasheet: 'https://docs.nvidia.com/networking/display/sn2201-and-sn2201-m-1g-management-switch-systems-user-manual.pdf',
    },
  },
  {
    id: 'nvidia-msn3700-cs2fc',
    model: 'MSN3700-CS2FC',
    manufacturer: 'NVIDIA',
    category: 'switch',
    description: 'Spectrum-2 Ethernet switch — 32× 100G QSFP28',
    partNumber: 'MSN3700-CS2FC',
    estimatedCost: '$14,000.00',
    specs: '1U | 32×100G QSFP28 | Spectrum-2 | ~450 W',
    vendorIds: ['nvidia'],
    links: {
      productPage: 'https://marketplace.nvidia.com/en-us/enterprise/networking/sn3700/',
      datasheet: 'https://docs.nvidia.com/networking/display/sn3000um',
    },
  },
  {
    id: 'nvidia-msn4700-ws2fc',
    model: 'MSN4700-WS2FC',
    manufacturer: 'NVIDIA',
    category: 'switch',
    description: 'Spectrum-3 Ethernet switch — 32× 400G QSFP-DD',
    partNumber: 'MSN4700-WS2FC',
    estimatedCost: '$22,000.00',
    specs: '1U | 32×400G QSFP-DD | Spectrum-3 | ~550 W',
    vendorIds: ['nvidia'],
    links: {
      productPage: 'https://marketplace.nvidia.com/en-us/enterprise/networking/sn4700/',
      datasheet: 'https://docs.nvidia.com/networking/display/nvidia-spectrum-3-sn4000-1u-and-2u-switch-systems-hardware-user-manual.pdf',
    },
  },
  {
    id: 'nvidia-sn5600',
    model: 'SN5600',
    manufacturer: 'NVIDIA',
    category: 'switch',
    description: 'Spectrum-4 Ethernet switch — 64× 800G OSFP',
    partNumber: 'SN5600',
    estimatedCost: '$55,000.00',
    specs: '2U | 64×800G OSFP | Spectrum-4 | ~2800 W',
    vendorIds: ['nvidia'],
    links: {
      productPage: 'https://marketplace.nvidia.com/en-us/enterprise/networking/sn5000/',
      datasheet: 'https://docs.nvidia.com/networking/display/nvidia-spectrum-4-sn5000-2u-switch-systems-hardware-user-manual.pdf',
    },
  },
];

export default nVidiaCatalog;
