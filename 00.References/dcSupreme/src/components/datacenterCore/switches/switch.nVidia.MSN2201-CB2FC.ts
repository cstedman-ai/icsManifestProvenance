import { SwitchSpecification } from '../index';

export const NVIDIAMSN2201CB2FCSpecification: SwitchSpecification = {
  model: 'MSN2201-CB2FC',
  manufacturer: 'NVIDIA',
  description: 'NVIDIA Spectrum SN2201 1GbE/100GbE Switch, 48x RJ45, 4x QSFP28',
  type: 'Ethernet',
  ports: {
    total: 52,
    types: [
      { type: '10/100/1000BASE-T (RJ45)', count: 48, speed: '1 Gb/s' },
      { type: '100G QSFP28', count: 4, speed: '100 Gb/s' }
    ]
  },
  performance: {
    switchingCapacity: '448 Gb/s',
    latency: 'Microsecond scale'
  },
  physical: {
    chassis: {
      rackUnits: 1,
      dimensions: {
        height: { imperial: 1.72, metric: 43.6, unitImperial: 'inches', unitMetric: 'mm' },
        width: { imperial: 17.24, metric: 438.0, unitImperial: 'inches', unitMetric: 'mm' },
        depth: { imperial: 12.0, metric: 305.0, unitImperial: 'inches', unitMetric: 'mm' }
      },
      weight: {
        imperial: 10.0,
        metric: 4.54,
        unitImperial: 'lbs',
        unitMetric: 'kg'
      }
    },
    cooling: {
      airflow: 'P2C (Power to Connector) / Rear-to-Front'
    }
  },
  power: {
    supplies: 'Redundant PSUs',
    maxConsumption: '~100W'
  },
  portCapacity: {
    fiber: 4, // 4x QSFP28 (100G fiber)
    ethernet: 48 // 48x RJ45 (1G copper)
  },
  compliance: [
    'RoHS',
    'CE',
    'FCC',
    'Safety: CB, cTUVus, CE'
  ],
  links: {
    manufacturer: 'https://www.nvidia.com',
    productPage: 'https://www.nvidia.com/en-us/networking/ethernet/sn2000/',
    datasheet: 'https://docs.nvidia.com/networking/display/SN2201'
  },
  estimatedCost: '$4,200.00',
  releaseDate: '2021'
};


