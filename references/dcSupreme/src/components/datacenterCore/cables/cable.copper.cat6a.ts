import { CableSpecification } from '../index';

export const CopperCat6aSpecification: CableSpecification = {
  model: "Generic Cat6a Patch Cable",
  type: "copper",
  category: "Cat6a",
  connector: "RJ45",
  shielding: "S/FTP (Shielded Foiled Twisted Pair)",
  jacket: "LSZH (Low Smoke Zero Halogen)",
  availableLengths: [
    { metric: 1, imperial: 3.28, unitMetric: 'm', unitImperial: 'ft' },
    { metric: 2, imperial: 6.56, unitMetric: 'm', unitImperial: 'ft' },
    { metric: 3, imperial: 9.84, unitMetric: 'm', unitImperial: 'ft' },
    { metric: 5, imperial: 16.40, unitMetric: 'm', unitImperial: 'ft' },
    { metric: 7, imperial: 22.97, unitMetric: 'm', unitImperial: 'ft' },
    { metric: 10, imperial: 32.81, unitMetric: 'm', unitImperial: 'ft' },
    { metric: 15, imperial: 49.21, unitMetric: 'm', unitImperial: 'ft' },
    { metric: 20, imperial: 65.62, unitMetric: 'm', unitImperial: 'ft' },
    { metric: 25, imperial: 82.02, unitMetric: 'm', unitImperial: 'ft' },
    { metric: 30, imperial: 98.43, unitMetric: 'm', unitImperial: 'ft' },
    { metric: 45, imperial: 147.64, unitMetric: 'm', unitImperial: 'ft' },
    { metric: 50, imperial: 164.04, unitMetric: 'm', unitImperial: 'ft' },
  ],
  technicalSpecs: {
    bandwidth: "10 Gbps",
    frequency: "500 MHz",
    gauge: "26 AWG",
    compliance: [
      "ISO/IEC 11801",
      "TIA/EIA-568-C.2",
      "RoHS",
      "REACH"
    ]
  }
};
