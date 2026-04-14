export type { Vendor } from './types';

export { default as dell } from './dell';
export { default as superMicro } from './superMicro';
export { default as nVidia } from './nVidia';
export { default as opengear } from './opengear';
export { default as uline } from './uline';
export { default as lumaOptics } from './lumaOptics';
export { default as quanta } from './quanta';
export { default as gigabyte } from './gigabyte';
export { default as proficium } from './proficium';
export { default as mellanox } from './mellanox';
export { default as molex } from './molex';

import dell from './dell';
import superMicro from './superMicro';
import nVidia from './nVidia';
import opengear from './opengear';
import uline from './uline';
import lumaOptics from './lumaOptics';
import quanta from './quanta';
import gigabyte from './gigabyte';
import proficium from './proficium';
import mellanox from './mellanox';
import molex from './molex';
import type { Vendor } from './types';

export const vendors: Vendor[] = [dell, superMicro, nVidia, opengear, uline, lumaOptics, quanta, gigabyte, proficium, mellanox, molex];
