import { ServerSpecification } from '../index';

export const DellXE9680H200Specification: ServerSpecification = {
  model: 'PowerEdge XE9680 (H200)',
  manufacturer: 'Dell Technologies',
  description: 'High-performance 6U AI rack server with 8x NVIDIA HGX H200 GPUs and BlueField-3 SuperNIC support',
  chassis: {
    formFactor: 'Rackmount',
    rackUnits: 6,
    dimensions: {
      height: {
        imperial: 10.36,
        metric: 263.2,
        unitImperial: 'inches',
        unitMetric: 'mm',
      },
      width: {
        imperial: 18.97,
        metric: 482.0,
        unitImperial: 'inches',
        unitMetric: 'mm',
      },
      depth: {
        imperial: 39.71, // With bezel/CMA, slightly deeper spec reference
        metric: 1008.77,
        unitImperial: 'inches',
        unitMetric: 'mm',
      },
    },
    weight: {
      max: {
        imperial: 251.44,
        metric: 114.05,
        unitImperial: 'lbs',
        unitMetric: 'kg',
      },
    },
  },
  compute: {
    processors: {
      model: '5th Gen Intel Xeon Scalable Processors',
      sockets: 2,
      maxCores: 64,
    },
    memory: {
      type: 'DDR5 RDIMM',
      slots: 32,
      maxCapacity: '4TB (up to 5600 MT/s)',
    },
    storage: {
      bays: 'Up to 8x 2.5" U.2 NVMe SSDs or 16x E3.S NVMe SSDs',
      supportedTypes: ['NVMe SSD'],
    },
    gpu: {
      model: 'NVIDIA HGX H200 SXM5',
      count: 8,
      memory: '141GB HBM3e per GPU (1.1TB total)',
      connection: 'NVIDIA NVLink / NVSwitch',
    },
  },
  networking: {
    ports: [
      '1x Ethernet RJ45 (Rear)',
      '1x Ethernet RJ45 (Front)',
      '8x MPO Fiber Ports (Front)',
      '2x LC Fiber Ports (Front)',
      '1x dedicated iDRAC Direct micro-USB',
      '1x USB 2.0',
      '1x VGA',
    ],
    options: [
      'Up to 10x PCIe Gen5 slots',
      'NVIDIA BlueField-3 SuperNIC support',
      'NVIDIA ConnectX-7 InfiniBand/Ethernet',
    ],
    portCapacity: {
      fiber: 10,
      ethernet: 2
    }
  },
  power: {
    powerSupply: '2800W Titanium Mixed Mode',
    quantity: 6,
    maxConsumption: '~11.5kW - 12.5kW', // H200 might draw slightly more power or similar to H100, but thermal envelope is same 700W/GPU.
  },
  cooling: {
    fans: 'High-performance Gold grade fans',
    type: 'Air cooled (standard) with optimized airflow for H200',
  },
  compliance: [
    'ASHRAE A2 compliant',
    'RoHS',
    'Energy Star',
  ],
  links: {
    manufacturer: 'https://www.dell.com',
    productPage: 'https://www.dell.com/en-us/shop/ipovw/poweredge-xe9680',
    datasheet: 'https://www.delltechnologies.com/asset/en-us/products/servers/technical-support/poweredge-xe9680-spec-sheet.pdf',
  },
  estimatedCost: '$400,000.00',
  releaseDate: 'Q2 2024',
};
