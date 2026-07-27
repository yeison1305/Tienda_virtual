import { ASSETS } from './assets';

export interface Review {
  name: string;
  rating: number;
  text: string;
  img: string;
  product: string;
}

export const REVIEWS: Review[] = [
  {
    name: "Valentina R.",
    rating: 5,
    text: "La calidad es increíble, los jeans quedan perfectos y la entrega fue rapidísima.",
    img: ASSETS.rev1,
    product: "Jean Slim Fit",
  },
  {
    name: "Sebastián M.",
    rating: 5,
    text: "Ropa que realmente dura. Ya voy por mi tercera compra y siempre impecable.",
    img: ASSETS.rev2,
    product: "Hoodie Essential",
  },
  {
    name: "Camila T.",
    rating: 5,
    text: "El estilo es exactamente lo que buscaba, minimalista y sofisticado.",
    img: ASSETS.rev3,
    product: "Chaqueta Premium",
  },
];
