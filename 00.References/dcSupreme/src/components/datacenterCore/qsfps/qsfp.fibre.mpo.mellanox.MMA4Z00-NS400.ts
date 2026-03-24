import { TransceiverSpecification } from '../index';

export const MellanoxMMA4Z00NS400Specification: TransceiverSpecification = {
  model: 'MMA4Z00-NS400',
  manufacturer: 'NVIDIA (Mellanox)',
  description: 'InfiniBand NDR400 (400Gb/s) Single-port OSFP Multimode Transceiver',
  formFactor: 'OSFP',
  type: '400G SR4',
  connector: 'Single MPO-12/APC',
  dataRate: '400 Gb/s',
  wavelength: '850 nm',
  reach: {
    value: 50,
    unit: 'm',
    conditions: 'OM4 fiber'
  },
  power: {
    maxConsumption: '14W' // Slightly lower than twin-port, generally OSFP allows high power but 400G SR4 is efficient
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
    productPage: 'https://docs.nvidia.com/networking/display/800gmma4z00ns', // Documentation often covers both
    datasheet: 'https://docs.nvidia.com/networking/display/mma4z00-ns400-400gb-s-osfp-sr4-multimode-transceiver.pdf'
  },
  estimatedCost: '$1,900.00',
  releaseDate: 'February 1, 2024'
};



