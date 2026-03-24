import { SwitchSpecification } from '../index';

export const NVIDIAMSN3700CS2FCSpecification: SwitchSpecification = {
  model: 'MSN3700-CS2FC',
  manufacturer: 'NVIDIA',
  description: 'NVIDIA Spectrum-2 SN3700C 32-port 100GbE Open Ethernet Switch, Cumulus Linux',
  type: 'Ethernet',
  ports: {
    total: 32,
    types: [
      { type: '100G QSFP28', count: 32, speed: '100 Gb/s' }
    ]
  },
  performance: {
    switchingCapacity: '6.4 Tb/s',
    latency: '425ns'
  },
  physical: {
    chassis: {
      rackUnits: 1,
      dimensions: {
        height: { imperial: 1.72, metric: 43.6, unitImperial: 'inches', unitMetric: 'mm' },
        width: { imperial: 16.84, metric: 428.0, unitImperial: 'inches', unitMetric: 'mm' },
        depth: { imperial: 22.0, metric: 559.0, unitImperial: 'inches', unitMetric: 'mm' }
      },
      weight: {
        imperial: 24.5,
        metric: 11.1,
        unitImperial: 'lbs',
        unitMetric: 'kg'
      }
    },
    cooling: {
      airflow: 'P2C (Power to Connector) / Rear-to-Front'
    }
  },
  power: {
    supplies: '2x Redundant Hot-swappable AC',
    maxConsumption: '450W (Max)' // 242W Typical
  },
  portCapacity: {
    fiber: 32, // 32x QSFP28 (100G fiber)
    ethernet: 0 // Fiber only
  },
  compliance: [
    'RoHS',
    'CE',
    'FCC',
    'CB',
    'Cumulus Linux Ready'
  ],
  links: {
    manufacturer: 'https://www.nvidia.com',
    productPage: 'https://www.nvidia.com/en-us/networking/ethernet/sn3000/',
    datasheet: 'https://docs.nvidia.com/networking/display/SN3700C'
  },
  estimatedCost: '$14,000.00',
  releaseDate: '2019'
};


