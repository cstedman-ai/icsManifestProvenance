import { CopperCat6aSpecification } from './cable.copper.cat6a';
import { FibreLCLCSpecification } from './cable.fibre.lclc';
import { FibreMPOSpecification } from './cable.fibre.mpo';
import { FibreMPOSplitterSpecification } from './cable.fibre.mpo.splitter';

export const CableSpecifications = [
  CopperCat6aSpecification,
  FibreLCLCSpecification,
  FibreMPOSpecification,
  FibreMPOSplitterSpecification,
];

export * from './cable.copper.cat6a';
export * from './cable.fibre.lclc';
export * from './cable.fibre.mpo';
export * from './cable.fibre.mpo.splitter';


