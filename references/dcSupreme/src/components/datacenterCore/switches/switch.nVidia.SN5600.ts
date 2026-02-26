import { SwitchSpecification } from '../index';

export const NVIDIASN5600Specification: SwitchSpecification = {
  model: 'SN5600',
  manufacturer: 'NVIDIA',
  description: 'NVIDIA Spectrum-4 SN5600 64-port 800GbE OSFP Ethernet Switch',
  type: 'Ethernet',
  ports: {
    total: 64,
    types: [
      { type: '800GbE OSFP', count: 64, speed: '800 Gb/s' }
    ]
  },
  performance: {
    switchingCapacity: '51.2 Tb/s',
    latency: 'Low latency'
  },
  physical: {
    chassis: {
      rackUnits: 2,
      dimensions: {
        height: { imperial: 3.39, metric: 86.2, unitImperial: 'inches', unitMetric: 'mm' },
        width: { imperial: 17.24, metric: 438.0, unitImperial: 'inches', unitMetric: 'mm' },
        depth: { imperial: 28.35, metric: 720.0, unitImperial: 'inches', unitMetric: 'mm' }
      },
      weight: {
        imperial: 51.8,
        metric: 23.5,
        unitImperial: 'lbs',
        unitMetric: 'kg'
      }
    },
    cooling: {
      airflow: 'P2C (Power to Connector) / Rear-to-Front'
    }
  },
  power: {
    supplies: 'Redundant Hot-swappable AC/DC',
    maxConsumption: '~2800W (Max with 64x 800G Optics)'
  },
  portCapacity: {
    fiber: 64, // 64x OSFP (800G fiber)
    ethernet: 0 // Fiber only
  },
  compliance: [
    'RoHS',
    'CE',
    'FCC',
    'Safety: CB, cTUVus',
    'Spectrum-4'
  ],
  links: {
    manufacturer: 'https://www.nvidia.com',
    productPage: 'https://www.nvidia.com/en-us/networking/ethernet-switching/spectrum-sn5000/',
    datasheet: 'https://www.nvidia.com/content/dam/en-zz/Solutions/networking/ethernet-switching/spectrum-sn5000-datasheet.pdf'
  },
  estimatedCost: '$55,000.00',
  releaseDate: '2024'
};

