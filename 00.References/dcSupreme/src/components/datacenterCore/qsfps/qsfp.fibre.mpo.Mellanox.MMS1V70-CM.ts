import { TransceiverSpecification } from '../index';

export const MellanoxMMS1V70CMSpecification: TransceiverSpecification = {
  model: 'MMS1V70-CM',
  manufacturer: 'NVIDIA (Mellanox)',
  description: '400Gb/s QSFP112 DR4 Single Mode Transceiver',
  formFactor: 'QSFP112',
  type: '400GBASE-DR4',
  connector: 'MPO-12/APC',
  dataRate: '400 Gb/s',
  wavelength: '1310 nm',
  reach: {
    value: 500,
    unit: 'm',
    conditions: 'OS2 Single Mode Fiber'
  },
  power: {
    maxConsumption: '10W'
  },
  compatibility: {
    cableType: 'OS2 Single Mode Fiber (MPO-12 APC)',
    devices: [
      'NVIDIA ConnectX-7 Network Adapters',
      'NVIDIA Spectrum-4 Switches (QSFP112 ports)',
      'BlueField-3 DPUs'
    ]
  },
  compliance: [
    'QSFP112 MSA',
    'IEEE 802.3bs',
    'RoHS',
    'Class 1 Laser Safety'
  ],
  links: {
    manufacturer: 'https://www.nvidia.com/en-us/networking/',
    productPage: 'https://docs.nvidia.com/networking/display/400gmms1v70cm',
    datasheet: 'https://docs.nvidia.com/networking/display/mms1v70-cm-400gb-s-qsfp112-dr4-single-mode-transceiver.pdf'
  },
  estimatedCost: '$1,800.00',
  releaseDate: '2022'
};



