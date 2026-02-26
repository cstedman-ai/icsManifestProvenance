export type { Vendor } from './types';

export { default as dell } from './dell';
export { default as superMicro } from './superMicro';
export { default as nVidia } from './nVidia';
export { default as opengear } from './opengear';

import dell from './dell';
import superMicro from './superMicro';
import nVidia from './nVidia';
import opengear from './opengear';
import type { Vendor } from './types';

export const vendors: Vendor[] = [dell, superMicro, nVidia, opengear];
