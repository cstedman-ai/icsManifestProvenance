import { MellanoxMMA4Z00NSSpecification } from './qsfp.fibre.mpo.mellanox.MMA4Z00-NS';
import { MellanoxMMA4Z00NS400Specification } from './qsfp.fibre.mpo.mellanox.MMA4Z00-NS400';
import { MellanoxMMS1V70CMSpecification } from './qsfp.fibre.mpo.Mellanox.MMS1V70-CM';
import { MellanoxMMS1V00WMSpecification } from './qsfp.fibre.mpo.Mellanox.MMS1V00-WM';
import { JuniperJNPQSFP100GLR4LUSpecification } from './qsfp.fibre.lc.Juniper.JNP-QSFP-100G-LR4-LU';
import { CiscoQDD400GLR4SLUSpecification } from './qsfp.fibre.lc.Cisco.QDD-400G-LR4-S-LU';
import { CompatibleQDD400GLR4SSpecification } from './qsfp.fibre.lc.Compatible.QDD-400G-LR4-S';
import { JuniperEXSFP10GELRLUSpecification } from './sfp.fibre.lc.Juniper.EX-SFP-10GE-LR-LU';

export const TransceiverSpecifications = [
  MellanoxMMA4Z00NSSpecification,
  MellanoxMMA4Z00NS400Specification,
  MellanoxMMS1V70CMSpecification,
  MellanoxMMS1V00WMSpecification,
  JuniperJNPQSFP100GLR4LUSpecification,
  CiscoQDD400GLR4SLUSpecification,
  CompatibleQDD400GLR4SSpecification,
  JuniperEXSFP10GELRLUSpecification,
];

export * from './qsfp.fibre.mpo.mellanox.MMA4Z00-NS';
export * from './qsfp.fibre.mpo.mellanox.MMA4Z00-NS400';
export * from './qsfp.fibre.mpo.Mellanox.MMS1V70-CM';
export * from './qsfp.fibre.mpo.Mellanox.MMS1V00-WM';
export * from './qsfp.fibre.lc.Juniper.JNP-QSFP-100G-LR4-LU';
export * from './qsfp.fibre.lc.Cisco.QDD-400G-LR4-S-LU';
export * from './qsfp.fibre.lc.Compatible.QDD-400G-LR4-S';
export * from './sfp.fibre.lc.Juniper.EX-SFP-10GE-LR-LU';
