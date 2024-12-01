import { Product } from "~/models/Product";

export type CartItem = {
  product: Product;
  count: number;
};

export type CartItemId = {
  productId: string;
  count: number;
};

export type Cart = {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  status: string;
  items: CartItem[];
}

export type CartData = {
  total: number;
  cart: Cart;
}
