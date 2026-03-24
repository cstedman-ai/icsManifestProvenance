import { CableSpecification } from '../index';

export const FibreMPOSpecification: CableSpecification = {
  model: "Generic OS2 MPO-12 APC Fiber Trunk Cable",
  type: "fiber",
  category: "OS2 Singlemode",
  connector: "MPO-12 (APC) Female-Female",
  shielding: "N/A (Dielectric)",
  jacket: "LSZH (Yellow)",
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
    bandwidth: "100/400 Gbps",
    frequency: "N/A (Singlemode)",
    gauge: "3.0mm Round",
    compliance: [
      "ISO/IEC 11801",
      "TIA-568.3-D",
      "IEC 61754-7 (MPO)",
      "RoHS",
      "REACH"
    ]
  }
};
