import { apiRequest } from './api';
import type { Product } from '../types';

type ProductResponse = {
  ok: boolean;
  product: Product;
};

type ProductsResponse = {
  ok: boolean;
  products: Product[];
};

export type ProductInput = {
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
  category: string;
};

export const fetchProducts = async () => {
  const response = await apiRequest<ProductsResponse>('/api/products');
  return response.products;
};

export const fetchProduct = async (id: string | number) => {
  const response = await apiRequest<ProductResponse>(`/api/products/${id}`);
  return response.product;
};

export const createProductRequest = async (payload: ProductInput, token: string) => {
  const response = await apiRequest<ProductResponse>('/api/products', {
    method: 'POST',
    body: payload,
    token,
  });

  return response.product;
};

export const updateProductRequest = async (
  id: number,
  payload: ProductInput,
  token: string
) => {
  const response = await apiRequest<ProductResponse>(`/api/products/${id}`, {
    method: 'PUT',
    body: payload,
    token,
  });

  return response.product;
};

export const deleteProductRequest = async (id: number, token: string) => {
  await apiRequest(`/api/products/${id}`, {
    method: 'DELETE',
    token,
  });
};
