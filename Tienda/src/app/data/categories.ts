import { ASSETS } from './assets';

export interface Category {
  name: string;
  img: string;
}

export const CATEGORIES: Category[] = [
  { name: "Jeans", img: ASSETS.catJeans },
  { name: "Camisetas", img: ASSETS.catCamisetas },
  { name: "Chaquetas", img: ASSETS.catChaquetas },
  { name: "Hoodies", img: ASSETS.catHoodies },
  { name: "Accesorios", img: ASSETS.catAccesorios },
];
