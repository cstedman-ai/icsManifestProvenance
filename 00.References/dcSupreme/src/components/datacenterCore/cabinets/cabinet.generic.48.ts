import { CabinetSpecification } from '../index';

export const Generic48Specification: CabinetSpecification = {
  model: "Generic 48U Rack Cabinet",
  manufacturer: "Generic / Standard",
  type: "48 RU / 48E Server Cabinet",
  rackUnits: 48,
  dimensions: {
    height: {
      imperial: 89.0, // Approx standard height for 48U
      metric: 2260.6,
      unitImperial: "inches",
      unitMetric: "mm"
    },
    width: {
      imperial: 23.6, // Standard width
      metric: 600.0,
      unitImperial: "inches",
      unitMetric: "mm"
    },
    depth: {
      imperial: 42.0, // Standard depth
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
      imperial: 365, // Slightly heavier than 44U
      metric: 165.5,
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
      imperial: 2250,
      metric: 1020.5,
      unitImperial: "lbs",
      unitMetric: "kg"
    }
  },
  features: {
    cableManagement: [
      "Extended Vertical Cable Management channels (4.0\" / 101.6mm width)",
      "Top and Bottom cable entry points",
      "Cable capacity: ~150-200 cables per channel",
      "Horizontal cable manager support (1U/2U)"
    ],
    cooling: [
      "Perforated front/rear doors (70-80% airflow)",
      "Front-to-rear airflow configuration",
      "Standard top-mount fan tray support",
      "Operating Temp: 50°F to 95°F (10°C to 35°C)"
    ],
    power: [
      "2 Full-Height Vertical PDU positions",
      "Zero-U PDU compatible (supports longer 48U PDUs)",
      "Up to 15kW capacity support",
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
    "RoHS Compliant",
    "UL Listed"
  ],
  partNumbers: {
    baseCabinet: "GEN-48U-STD",
    withDoors: "GEN-48U-KIT",
    seismicKit: "GEN-SEISMIC-48",
    cableMgmtKit: "GEN-CM-48"
  }
};

export const CableRunEstimates48U = {
  verticalFull: { imperial: 100, metric: 2540, unit: "inches/mm" }, // Taller vertical run for 48U
  horizontalRailToRear: { imperial: 20, metric: 508, unit: "inches/mm" },
  intraCabinet: { min: 7, max: 12, unit: "feet" }, // Slightly longer runs possible
  adjacentCabinet: { min: 10, max: 16, unit: "feet" },
  sameRow: { min: 16, max: 50, unit: "feet" }
};

