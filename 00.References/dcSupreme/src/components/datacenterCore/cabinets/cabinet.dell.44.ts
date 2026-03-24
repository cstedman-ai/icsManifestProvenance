import { CabinetSpecification } from '../index';

export const Dell44Specification: CabinetSpecification = {
  model: "Dell 44U Rack Cabinet",
  manufacturer: "Dell Technologies",
  type: "44 RU / 44E Server Cabinet",
  rackUnits: 44,
  dimensions: {
    height: {
      imperial: 77.0,
      metric: 1955.8,
      unitImperial: "inches",
      unitMetric: "mm"
    },
    width: {
      imperial: 23.6,
      metric: 599.4,
      unitImperial: "inches",
      unitMetric: "mm"
    },
    depth: {
      imperial: 42.0,
      metric: 1066.8,
      unitImperial: "inches",
      unitMetric: "mm"
    },
    internalDepth: {
      imperial: 37.5,
      metric: 952.5,
      unitImperial: "inches",
      unitMetric: "mm"
    }
  },
  weight: {
    empty: {
      imperial: 330,
      metric: 149.7,
      unitImperial: "lbs",
      unitMetric: "kg"
    },
    maxStaticLoad: {
      imperial: 3000,
      metric: 1360.8,
      unitImperial: "lbs",
      unitMetric: "kg"
    },
    maxDynamicLoad: {
      imperial: 2000,
      metric: 907.2,
      unitImperial: "lbs",
      unitMetric: "kg"
    }
  },
  features: {
    cableManagement: [
      "Vertical Cable Management channels (4.0\" / 101.6mm width)",
      "Top and Bottom cable entry points with brush grommets",
      "Cable capacity: ~100-150 cables per channel",
      "Horizontal cable manager support (1U/2U)"
    ],
    cooling: [
      "Perforated front/rear doors (75-80% airflow)",
      "Front-to-rear airflow configuration",
      "Optional 1U/2U fan units (200-400 CFM)",
      "Operating Temp: 50°F to 95°F (10°C to 35°C)"
    ],
    power: [
      "2 Vertical PDU positions (rear)",
      "Zero-U PDU compatible",
      "Up to 12kW standard capacity",
      "Grounding studs (front and rear)"
    ],
    security: [
      "Keyed locks on front and rear doors",
      "Reversible front door",
      "Split rear doors",
      "Removable locking side panels"
    ]
  },
  compliance: [
    "EIA-310-D",
    "IEC 60297",
    "DIN 41494 SC48D",
    "UL Listed (UL 60950-1)",
    "RoHS Compliant"
  ],
  partNumbers: {
    baseCabinet: "770-BBIN",
    withDoors: "770-BBIQ",
    seismicKit: "770-10328",
    cableMgmtKit: "770-10330"
  }
};

export const CableRunEstimates = {
  verticalFull: { imperial: 92, metric: 2337, unit: "inches/mm" }, // Top to bottom + slack
  horizontalRailToRear: { imperial: 20, metric: 508, unit: "inches/mm" },
  intraCabinet: { min: 6, max: 10, unit: "feet" },
  adjacentCabinet: { min: 10, max: 16, unit: "feet" },
  sameRow: { min: 16, max: 50, unit: "feet" }
};

