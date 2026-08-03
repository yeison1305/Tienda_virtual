import { ASSETS } from './assets';

export interface InspoImage {
  src: string;
  tall: boolean;
  instagramUrl?: string;
}

export const INSPO_IMGS: InspoImage[] = [
  { src: ASSETS.ins1, tall: true, instagramUrl: "https://instagram.com" },
  { src: ASSETS.ins2, tall: false, instagramUrl: "https://instagram.com" },
  { src: ASSETS.ins3, tall: false, instagramUrl: "https://instagram.com" },
  { src: ASSETS.ins4, tall: true, instagramUrl: "https://instagram.com" },
  { src: ASSETS.ins5, tall: false, instagramUrl: "https://instagram.com" },
  { src: ASSETS.ins6, tall: false, instagramUrl: "https://instagram.com" },
  { src: ASSETS.ins7, tall: true, instagramUrl: "https://instagram.com" },
  { src: ASSETS.ins8, tall: false, instagramUrl: "https://instagram.com" },
];
