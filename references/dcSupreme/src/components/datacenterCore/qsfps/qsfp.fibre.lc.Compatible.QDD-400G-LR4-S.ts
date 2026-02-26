import { TransceiverSpecification } from '../index';

export const CompatibleQDD400GLR4SSpecification: TransceiverSpecification = {
  model: 'QDD-400G-LR4-S (Compatible)',
  manufacturer: 'Third Party / Compatible',
  description: 'Cisco Compatible 400GBASE-LR4 QSFP-DD PAM4 1310nm 10km DOM Duplex LC/UPC SMF Transceiver',
  formFactor: 'QSFP-DD',
  type: '400GBASE-LR4',
  connector: 'LC/UPC Duplex',
  dataRate: '400 Gb/s',
  wavelength: '1310 nm (CWDM/LAN-WDM)',
  reach: {
    value: 10,
    unit: 'km',
    conditions: 'OS2 Single Mode Fiber'
  },
  power: {
    maxConsumption: '10W'
  },
  compatibility: {
    cableType: 'OS2 Single Mode Fiber (LC-LC)',
    devices: [
      'Cisco Nexus 9000',
      'Cisco NCS 5500',
      'MSA Compliant QSFP-DD Ports'
    ]
  },
  compliance: [
    'QSFP-DD MSA',
    'IEEE 802.3bs',
    'RoHS',
    'Class 1 Laser Safety'
  ],
  links: {
    manufacturer: 'https://www.fs.com', // Example compatible vendor
    productPage: 'https://www.fs.com/c/400g-qsfp-dd-3198',
    datasheet: 'https://www.fs.com/file/datasheet/400g-qsfp-dd-lr4-transceiver-datasheet.pdf'
  },
  estimatedCost: '$1,200.00',
  releaseDate: '2021'
};


