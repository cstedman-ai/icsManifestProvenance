import { ServerSpecification } from '../index';

export const DellXE9680H100Specification: ServerSpecification = {
  model: 'PowerEdge XE9680',
  manufacturer: 'Dell Technologies',
  description: 'High-performance 6U AI rack server with 8x NVIDIA H100 GPUs',
  chassis: {
    formFactor: 'Rackmount',
    rackUnits: 6,
    dimensions: {
      height: {
        imperial: 10.37,
        metric: 263.5,
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
        imperial: 35.86, // 911.0mm chassis depth
        metric: 911.0,
        unitImperial: 'inches',
        unitMetric: 'mm',
      },
    },
    weight: {
      max: {
        imperial: 235.9,
        metric: 107.0,
        unitImperial: 'lbs',
        unitMetric: 'kg',
      },
    },
  },
  compute: {
    processors: {
      model: '4th/5th Gen Intel Xeon Scalable Processors',
      sockets: 2,
      maxCores: 64, // Per socket usually, depends on specific SKU
    },
    memory: {
      type: 'DDR5 RDIMM',
      slots: 32,
      maxCapacity: '4TB (using 128GB DIMMs)', // Or higher with 256GB
    },
    storage: {
      bays: 'Up to 8x 2.5" U.2 NVMe SSDs or 16x E3.S NVMe SSDs',
      supportedTypes: ['NVMe SSD'],
    },
    gpu: {
      model: 'NVIDIA HGX H100 SXM5',
      count: 8,
      memory: '80GB HBM3 per GPU (640GB total)',
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
      'Support for NVIDIA ConnectX-7 InfiniBand/Ethernet',
      'Support for BlueField-3 DPUs',
    ],
    portCapacity: {
      fiber: 10,
      ethernet: 2
    }
  },
  power: {
    powerSupply: '2800W Mixed Mode Platinum/Titanium',
    quantity: 6,
    maxConsumption: '~10kW - 11.5kW depending on load', // 6x2800W is capacity, actual draw for 8xH100 + CPUs is around 10-11kW
  },
  cooling: {
    fans: 'High-performance Gold grade fans',
    type: 'Air cooled (standard) or DLC (optional)',
  },
  compliance: [
    'ASHRAE A2 compliant',
    'RoHS',
    'Energy Star',
  ],
  links: {
    manufacturer: 'https://www.dell.com',
    productPage: 'https://www.dell.com/en-us/shop/ipovw/poweredge-xe9680',
    datasheet: 'https://i.dell.com/sites/csdocuments/Product_Docs/en/poweredge-xe9680-spec-sheet.pdf',
  },
  estimatedCost: '$350,000.00',
  releaseDate: 'March 2023',
};
