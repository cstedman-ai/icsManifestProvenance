import { TransceiverSpecification } from '../index';

export const CiscoQDD400GLR4SLUSpecification: TransceiverSpecification = {
  model: 'QDD-400G-LR4-S-LU',
  manufacturer: 'Cisco',
  description: '400GBASE-LR4 QSFP-DD Single Mode Transceiver (LC Duplex)',
  formFactor: 'QSFP-DD',
  type: '400GBASE-LR4',
  connector: 'LC Duplex',
  dataRate: '400 Gb/s',
  wavelength: '1271nm, 1291nm, 1311nm, 1331nm (CWDM)',
  reach: {
    value: 10,
    unit: 'km',
    conditions: 'OS2 Single Mode Fiber'
  },
  power: {
    maxConsumption: '9.5W'
  },
  compatibility: {
    cableType: 'OS2 Single Mode Fiber (LC-LC)',
    devices: [
      'Cisco Nexus 9000 Series',
      'Cisco NCS 5500 Series',
      'Cisco ASR 9000 Series'
    ]
  },
  compliance: [
    'QSFP-DD MSA',
    'IEEE 802.3bs',
    'RoHS',
    'Class 1 Laser Safety'
  ],
  links: {
    manufacturer: 'https://www.cisco.com/',
    productPage: 'https://www.cisco.com/c/en/us/products/interfaces-modules/400g-qsfp-dd-transceiver-modules/index.html',
    datasheet: 'https://www.cisco.com/c/en/us/products/collateral/interfaces-modules/400g-qsfp-dd-transceiver-modules/datasheet-c78-742042.html'
  },
  estimatedCost: '$4,000.00',
  releaseDate: '2021'
};


