import { ServerSpecification } from '../index';

export const DellPowerEdgeXE9712Specification: ServerSpecification = {
  model: 'PowerEdge XE9712',
  manufacturer: 'Dell Technologies',
  description: 'NVIDIA GB200 NVL72 Compute Node (1U Sled) for AI at Scale with Liquid Cooling',
  chassis: {
    formFactor: '1U Sled (ORv3 Rack)',
    rackUnits: 1,
    dimensions: {
      height: {
        imperial: 1.72,
        metric: 43.6,
        unitImperial: 'inches',
        unitMetric: 'mm',
      },
      width: {
        imperial: 17.24,
        metric: 438.0,
        unitImperial: 'inches',
        unitMetric: 'mm',
      },
      depth: {
        imperial: 31.77,
        metric: 807.0,
        unitImperial: 'inches',
        unitMetric: 'mm',
      },
    },
    weight: {
      max: {
        imperial: 66.14,
        metric: 30.0,
        unitImperial: 'lbs',
        unitMetric: 'kg',
      },
    },
  },
  compute: {
    processors: {
      model: '2x NVIDIA Grace CPUs (72 cores each)',
      sockets: 2,
      maxCores: 144,
    },
    memory: {
      type: 'LPDDR5X (Unified)',
      slots: 0, // Soldered
      maxCapacity: 'Up to 480GB LPDDR5X per CPU',
    },
    storage: {
      bays: 'Up to 8x E1.S NVMe SSDs',
      supportedTypes: ['E1.S NVMe'],
    },
    gpu: {
      model: 'NVIDIA Blackwell GB200',
      count: 2, // Configuration dependent, typically 2 GPUs per Grace in GB200 Superchip? Or 2 Superchips per tray?
      memory: '288GB HBM3e per GPU',
      connection: 'NVLink (Rack Scale)',
    },
  },
  networking: {
    ports: [
      '1x RJ45 Management',
      '1x USB 3.0',
      '1x Mini DisplayPort',
      '1x USB 2.0 Micro-B',
    ],
    options: [
      '1x NVIDIA BlueField-3 SuperNIC',
      'PCIe Gen5/Gen6 Expansion Slots',
    ],
    portCapacity: {
      fiber: 6,
      ethernet: 3
    }
  },
  power: {
    powerSupply: 'Rack Busbar (DC)',
    quantity: 0,
    maxConsumption: 'High Density (Liquid Cooled)',
  },
  cooling: {
    fans: 'Liquid Cooled (Cold Plates)',
    type: 'Direct Liquid Cooling (DLC)',
  },
  compliance: [
    'ORv3',
    'RoHS',
    'NVIDIA MGX',
  ],
  links: {
    manufacturer: 'https://www.dell.com',
    productPage: 'https://www.dell.com/en-us/shop/ipovw/poweredge-xe9712',
    datasheet: 'https://www.dell.com/en-us/shop/ipovw/poweredge-xe9712', // Using product page as datasheet source often linked there
  },
  estimatedCost: '$120,000.00', // Estimate for a single compute sled
  releaseDate: 'Late 2024',
};
