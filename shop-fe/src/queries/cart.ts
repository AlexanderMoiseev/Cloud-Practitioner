import axios, { AxiosError } from "axios";
import React from "react";
import { useQuery, useQueryClient, useMutation } from "react-query";
import API_PATHS from "~/constants/apiPaths";
import { CartItem } from "~/models/CartItem";
import { Product } from "~/models/Product";

export type CartItemId = {
  productId: string;
  count: number;
};

export function useCart() {
  return useQuery<CartItem[], AxiosError>("cart", async () => {
    const res = await axios.get<CartItem[]>(`${API_PATHS.cart}/profile/cart`, {
      headers: {
        Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
      },
    });

    const data = (res.data as any).data.cart.items as CartItemId[];
    const products = await Promise.all(
      data.map(async (item) => {
        const productRes = await axios.get<Product>(
          `${API_PATHS.bff}/products/${item.productId}`
        );
        debugger;
        return {
          product: productRes.data,
          count: item.count,
        };
      })
    );
    debugger;
    return products as CartItem[];

    // const result = (res.data as any).data.cart.items as CartItem[];
    // return result;
  });
}

export function useCartData() {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<CartItem[]>("cart");
}

export function useInvalidateCart() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("cart", { exact: true }),
    []
  );
}

export function useUpsertCart() {
  return useMutation((values: CartItem) => {
    const { product, count } = values;
    const req = { items: [{ productId: product.id, count }] };
    
    return axios.put<CartItem[]>(`${API_PATHS.cart}/profile/cart`, req, {
      headers: {
        Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
      },
    })
  }
  );
}

