import { ASSETS } from './assets';

export interface InspoImage {
  src: string;
  tall: boolean;
}

export const INSPO_IMGS: InspoImage[] = [
  { src: ASSETS.ins1, tall: true },
  { src: ASSETS.ins2, tall: false },
  { src: ASSETS.ins3, tall: false },
  { src: ASSETS.ins4, tall: true },
  { src: ASSETS.ins5, tall: false },
  { src: ASSETS.ins6, tall: false },
  { src: ASSETS.ins7, tall: true },
  { src: ASSETS.ins8, tall: false },
];
