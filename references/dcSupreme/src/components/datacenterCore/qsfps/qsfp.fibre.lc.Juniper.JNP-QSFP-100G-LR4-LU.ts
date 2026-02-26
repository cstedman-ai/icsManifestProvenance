import { TransceiverSpecification } from '../index';

export const JuniperJNPQSFP100GLR4LUSpecification: TransceiverSpecification = {
  model: 'JNP-QSFP-100G-LR4-LU',
  manufacturer: 'Juniper Networks',
  description: '100GBASE-LR4 QSFP28 Single Mode Transceiver (LC Duplex)',
  formFactor: 'QSFP28',
  type: '100GBASE-LR4',
  connector: 'LC Duplex',
  dataRate: '100 Gb/s',
  wavelength: '1295nm, 1300nm, 1304nm, 1309nm (LAN-WDM)',
  reach: {
    value: 10,
    unit: 'km',
    conditions: 'OS2 Single Mode Fiber'
  },
  power: {
    maxConsumption: '3.5W'
  },
  compatibility: {
    cableType: 'OS2 Single Mode Fiber (LC-LC)',
    devices: [
      'Juniper MX Series Routers',
      'Juniper PTX Series Packet Transport Routers',
      'Juniper QFX Series Switches'
    ]
  },
  compliance: [
    'QSFP28 MSA',
    'IEEE 802.3ba 100GBASE-LR4',
    'RoHS',
    'Class 1 Laser Safety'
  ],
  links: {
    manufacturer: 'https://www.juniper.net/',
    productPage: 'https://apps.juniper.net/hct/model/?component=JNP-QSFP-100G-LR4',
    datasheet: 'https://www.juniper.net/assets/us/en/local/pdf/datasheets/1000539-en.pdf'
  },
  estimatedCost: '$2,500.00',
  releaseDate: '2016'
};


