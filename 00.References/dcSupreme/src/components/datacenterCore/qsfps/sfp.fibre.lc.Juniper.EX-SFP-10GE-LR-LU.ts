import { TransceiverSpecification } from '../index';

export const JuniperEXSFP10GELRLUSpecification: TransceiverSpecification = {
  model: 'EX-SFP-10GE-LR-LU',
  manufacturer: 'Juniper Networks',
  description: '10GBASE-LR SFP+ Single Mode Transceiver (LC Duplex)',
  formFactor: 'SFP+',
  type: '10GBASE-LR',
  connector: 'LC Duplex',
  dataRate: '10.3 Gb/s',
  wavelength: '1310 nm',
  reach: {
    value: 10,
    unit: 'km',
    conditions: 'OS2 Single Mode Fiber'
  },
  power: {
    maxConsumption: '1W'
  },
  compatibility: {
    cableType: 'OS2 Single Mode Fiber (LC-LC)',
    devices: [
      'Juniper EX Series Switches',
      'Juniper QFX Series Switches',
      'Juniper MX Series Routers'
    ]
  },
  compliance: [
    'SFP+ MSA',
    'IEEE 802.3ae 10GBASE-LR',
    'RoHS',
    'Class 1 Laser Safety'
  ],
  links: {
    manufacturer: 'https://www.juniper.net/',
    productPage: 'https://apps.juniper.net/hct/model/?component=EX-SFP-10GE-LR',
    datasheet: 'https://www.juniper.net/assets/us/en/local/pdf/datasheets/1000255-en.pdf'
  },
  estimatedCost: '$900.00',
  releaseDate: '2009'
};


