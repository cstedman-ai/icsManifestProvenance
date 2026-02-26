import { PDUSpecification } from '../index';

export const EnlogicEN6950Specification: PDUSpecification = {
  model: 'EN6950',
  manufacturer: 'Enlogic',
  description: 'Input Metered, Outlet Switched, 3-Phase Zero-U PDU',
  electrical: {
    input: {
      voltage: '400-415V 3PH Wye',
      current: '63A (3P+N+E) / 48A Derated',
      frequency: '50/60 Hz',
      maxPower: '43.5 kVA',
      plugType: 'IEC 60309 3P+N+E 6h 63A (IP44)',
    },
    output: {
      voltage: '200-240VAC (Phase-to-Neutral)',
      outlets: [
        { type: 'C13/C15', quantity: 21 },
        { type: 'C13/C19 Combo', quantity: 21 },
      ],
      overloadProtection: '(12) 1-pole, 20A, 10 kAIC, temp stable, hy-mag circuit breakers',
    },
  },
  metering: {
    attributes: [
      'Voltage (V)',
      'Current (A)',
      'Apparent Power (kVA)',
      'Real Power (kW)',
      'Power Factor',
      'Energy (kWh)',
      'Frequency',
    ],
    accuracy: '±1% Billing Grade Accuracy (ISO/IEC 62052-21)',
    locations: [
      'Input Phase',
      'Circuit Breaker',
      'Outlet Level',
    ],
    remoteOutletSwitching: true,
  },
  networkManagement: {
    connectivity: [
      'Dual Gigabit Ethernet ports (10/100/1000 Mbps)',
      'Daisy-chain support for up to 64 units',
    ],
    protocols: [
      'HTTP/HTTPS',
      'SNMP v1/v2c/v3',
      'SSH',
      'Telnet',
      'SMTP',
      'Modbus-TCP',
      'LDAP',
      'RADIUS',
      'Redfish API',
    ],
    features: [
      'Hot-swappable Network Management Card (NMC)',
      'Environmental sensor support (temp/humidity/access/water)',
      'Color LCD display',
    ],
  },
  physical: {
    dimensions: {
      height: {
        imperial: 71.89,
        metric: 1826.0,
        unitImperial: 'inches',
        unitMetric: 'mm',
      },
      width: {
        imperial: 2.20,
        metric: 56.0,
        unitImperial: 'inches',
        unitMetric: 'mm',
      },
      depth: {
        imperial: 2.95,
        metric: 75.0,
        unitImperial: 'inches',
        unitMetric: 'mm',
      },
    },
    cordLength: {
      imperial: 118.11, // 3 meters
      metric: 3000, 
      unitImperial: 'inches',
      unitMetric: 'mm',
    },
  },
  environmental: {
    operatingTemp: '-5 to 60°C (23 to 140°F)',
    storageTemp: '-20 to 60°C (-4 to 140°F)',
    humidity: '5-90% RH operating, 5-95% RH storage (non-condensing)',
    maxElevation: '3,000 m (9,840 ft) operating',
  },
  compliance: [
    'CE',
    'UKCA',
    'IEC 62368-1',
    'EN 55032',
    'EN 55035',
    'RoHS',
    'REACH',
    'WEEE',
  ],
  links: {
    manufacturer: 'https://enlogic.com',
    productPage: 'https://enlogic.com/product/EN6950',
    datasheet: 'https://enlogic.com/public/assets/images/products/downloads/1694681591-EN6950-Spec-Sheet-R.pdf',
  },
  estimatedCost: '$2,101.00',
  releaseDate: 'October 2024',
};
