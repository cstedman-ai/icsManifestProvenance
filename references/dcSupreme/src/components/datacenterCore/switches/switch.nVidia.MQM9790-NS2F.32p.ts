import { SwitchSpecification } from '../index';

export const NVIDIAMQM9790NS2FSpecification: SwitchSpecification = {
  model: 'MQM9790-NS2F',
  manufacturer: 'NVIDIA',
  description: 'NVIDIA Quantum-2 NDR InfiniBand Switch, 64-port 400Gb/s (32x OSFP)',
  type: 'InfiniBand',
  ports: {
    total: 64,
    types: [
      {
        type: 'OSFP',
        count: 32,
        speed: '800Gb/s (Supports 2x400Gb/s NDR)'
      }
    ]
  },
  performance: {
    switchingCapacity: '51.2 Tb/s aggregate',
    latency: '< 350ns (Port-to-Port)'
  },
  physical: {
    chassis: {
      rackUnits: 1,
      dimensions: {
        height: {
          imperial: 1.72,
          metric: 43.6,
          unitImperial: 'inches',
          unitMetric: 'mm'
        },
        width: {
          imperial: 17.24,
          metric: 438.0,
          unitImperial: 'inches',
          unitMetric: 'mm'
        },
        depth: {
          imperial: 26.0,
          metric: 660.0,
          unitImperial: 'inches',
          unitMetric: 'mm'
        }
      },
      weight: {
        imperial: 27.6,
        metric: 12.5,
        unitImperial: 'lbs',
        unitMetric: 'kg'
      }
    },
    cooling: {
      airflow: 'P2C (Power to Connector / Rear-to-Front) Airflow'
    }
  },
  power: {
    supplies: '2x Redundant Hot-swappable PSUs',
    maxConsumption: '~1300W (Max with 32x OSFP)'
  },
  portCapacity: {
    fiber: 64, // 32 OSFP ports, each can split to 2x400G = 64 ports
    ethernet: 0 // InfiniBand only
  },
  compliance: [
    'IBTA 1.5',
    'RoHS',
    'Safety: CB, cTUVus, CE, CU',
    'EMC: CE, FCC, VCCI, ICES, RCM'
  ],
  links: {
    manufacturer: 'https://www.nvidia.com',
    productPage: 'https://www.nvidia.com/en-us/networking/products/infiniband-switch-systems/quantum-2/',
    datasheet: 'https://docs.nvidia.com/networking/display/QM97X0PUB'
  },
  estimatedCost: '$32,000.00',
  releaseDate: 'Q1 2022'
};

