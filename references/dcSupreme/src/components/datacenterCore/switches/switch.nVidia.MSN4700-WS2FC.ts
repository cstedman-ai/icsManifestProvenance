import { SwitchSpecification } from '../index';

export const NVIDIAMSN4700WS2FCSpecification: SwitchSpecification = {
  model: 'MSN4700-WS2FC',
  manufacturer: 'NVIDIA',
  description: 'NVIDIA Spectrum-3 SN4700 32-port 400GbE Switch, QSFP-DD, Cumulus Linux',
  type: 'Ethernet',
  ports: {
    total: 32,
    types: [
      { type: '400GbE QSFP-DD', count: 32, speed: '400 Gb/s' }
    ]
  },
  performance: {
    switchingCapacity: '12.8 Tb/s',
    latency: '425ns'
  },
  physical: {
    chassis: {
      rackUnits: 1,
      dimensions: {
        height: { imperial: 1.72, metric: 43.6, unitImperial: 'inches', unitMetric: 'mm' },
        width: { imperial: 17.24, metric: 438.0, unitImperial: 'inches', unitMetric: 'mm' },
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
    maxConsumption: '550W (Typical)'
  },
  portCapacity: {
    fiber: 32, // 32x QSFP-DD (400G fiber)
    ethernet: 0 // Fiber only
  },
  compliance: [
    'RoHS',
    'CE',
    'FCC',
    'Safety: CB, cTUVus',
    'Spectrum-3 Architecture'
  ],
  links: {
    manufacturer: 'https://www.nvidia.com',
    productPage: 'https://www.nvidia.com/en-us/networking/ethernet/sn4000/',
    datasheet: 'https://docs.nvidia.com/networking/display/SN4000'
  },
  estimatedCost: '$22,000.00',
  releaseDate: '2020'
};

