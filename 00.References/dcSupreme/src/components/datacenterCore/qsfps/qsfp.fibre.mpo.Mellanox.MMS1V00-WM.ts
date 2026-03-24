import { TransceiverSpecification } from '../index';

export const MellanoxMMS1V00WMSpecification: TransceiverSpecification = {
  model: 'MMS1V00-WM',
  manufacturer: 'NVIDIA (Mellanox)',
  description: '400Gb/s QSFP-DD DR4 Single Mode Transceiver (400GAUI-8 Electrical)',
  formFactor: 'QSFP-DD',
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
    maxConsumption: '12W'
  },
  compatibility: {
    cableType: 'OS2 Single Mode Fiber (MPO-12 APC)',
    devices: [
      'NVIDIA Spectrum-3 SN4000 Series',
      'Switches with QSFP-DD ports supporting 400GAUI-8'
    ]
  },
  compliance: [
    'QSFP-DD MSA',
    'IEEE 802.3bs (400GBASE-DR4)',
    'RoHS',
    'Class 1 Laser Safety'
  ],
  links: {
    manufacturer: 'https://www.nvidia.com/en-us/networking/',
    productPage: 'https://docs.nvidia.com/networking/display/400gmms1v00wm',
    datasheet: 'https://docs.nvidia.com/networking/display/mms1v00-wm-400gb-s-qsfp-dd-dr4-single-mode-transceiver.pdf'
  },
  estimatedCost: '$2,200.00',
  releaseDate: '2020'
};


