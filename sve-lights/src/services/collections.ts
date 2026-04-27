import { apiRequest } from './api';
import type { CollectionItem } from '../types';

type CollectionsResponse = {
  ok: boolean;
  collections: CollectionItem[];
  categories: string[];
  pagination?: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
};

type CollectionResponse = {
  ok: boolean;
  collection: CollectionItem;
};

export type CollectionInput = {
  productName: string;
  description: string;
  price: number;
  image: string;
  category: string;
  marketplace: string;
  productUrl: string;
  stock: number;
};

export const fetchCollectionsRequest = async (query = '') => {
  const response = await apiRequest<CollectionsResponse>(`/api/collections${query}`);
  return response;
};

export const createCollectionRequest = async (payload: CollectionInput, token: string) => {
  const response = await apiRequest<CollectionResponse>('/api/collections', {
    method: 'POST',
    body: payload,
    token,
  });

  return response.collection;
};

export const updateCollectionRequest = async (
  id: number,
  payload: CollectionInput,
  token: string
) => {
  const response = await apiRequest<CollectionResponse>(`/api/collections/${id}`, {
    method: 'PUT',
    body: payload,
    token,
  });

  return response.collection;
};

export const deleteCollectionRequest = async (id: number, token: string) => {
  await apiRequest(`/api/collections/${id}`, {
    method: 'DELETE',
    token,
  });
};
