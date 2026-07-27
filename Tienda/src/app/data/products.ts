import { ASSETS } from './assets';

export interface Product {
  id: number;
  name: string;
  price: number;
  original: number;
  colors: string[];
  img: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Jean Slim Fit",
    price: 89900,
    original: 119900,
    colors: ["#1A1A2E", "#4A4A4A", "#8B6914"],
    img: ASSETS.p1,
  },
  {
    id: 2,
    name: "Camiseta Oversized",
    price: 45900,
    original: 59900,
    colors: ["#FAFAFA", "#0A0A0A", "#C4A882"],
    img: ASSETS.p2,
  },
  {
    id: 3,
    name: "Chaqueta Premium",
    price: 159900,
    original: 199900,
    colors: ["#2C2C2C", "#6B4423", "#1C3A5E"],
    img: ASSETS.p3,
  },
  {
    id: 4,
    name: "Hoodie Essential",
    price: 75900,
    original: 95900,
    colors: ["#EBEBEB", "#0A0A0A", "#8B7355"],
    img: ASSETS.p4,
  },
];

export const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
