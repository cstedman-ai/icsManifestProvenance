import { TransceiverSpecification } from '../index';

export const MellanoxMMA4Z00NSSpecification: TransceiverSpecification = {
  model: 'MMA4Z00-NS',
  manufacturer: 'NVIDIA (Mellanox)',
  description: 'InfiniBand and Ethernet 800Gb/s Twin-port OSFP Multimode Transceiver',
  formFactor: 'OSFP',
  type: '2x400G SR4 (Twin-port)',
  connector: 'Dual MPO-12/APC',
  dataRate: '800 Gb/s (2x 400Gb/s)',
  wavelength: '850 nm',
  reach: {
    value: 50,
    unit: 'm',
    conditions: 'OM4 fiber'
  },
  power: {
    maxConsumption: '17W'
  },
  compliance: [
    'OSFP MSA',
    'CMIS 4.0',
    'IEEE 802.3db',
    'RoHS',
    'Class 1 Laser Safety'
  ],
  links: {
    manufacturer: 'https://www.nvidia.com/en-us/networking/',
    productPage: 'https://docs.nvidia.com/networking/display/800gmma4z00ns',
    datasheet: 'https://docs.nvidia.com/networking/display/mma4z00-ns-800gb-s-twin-port-osfp-2x400gb-s-multimode-2xsr4-50m.pdf'
  },
  estimatedCost: '$2,500.00',
  releaseDate: 'February 1, 2024'
};



