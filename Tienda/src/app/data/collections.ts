import { ASSETS } from './assets';

export interface Collection {
  name: string;
  tag: string;
}

export const COLLECTIONS: Collection[] = [
  { name: "Nueva Colección", tag: "NEW" },
  { name: "Best Sellers", tag: "TOP" },
  { name: "Streetwear", tag: "DROP" },
  { name: "Denim", tag: "EDIT" },
  { name: "Oversized", tag: "FW25" },
  { name: "Limited Edition", tag: "LTD" },
];

export const COLL_IMGS = [
  ASSETS.col1,
  ASSETS.col2,
  ASSETS.col3,
  ASSETS.col4,
  ASSETS.col5,
  ASSETS.col6
];
