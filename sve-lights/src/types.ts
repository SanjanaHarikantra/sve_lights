export type UserRole = 'admin' | 'user';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  stock: number;
  category: string;
  stockStatus: 'In Stock' | 'Out of Stock';
  lowStockMessage: string;
  createdAt: string;
  updatedAt?: string;
};

export type AuthResponse = {
  ok: boolean;
  token: string;
  user: AuthUser;
};

export type CollectionItem = {
  id: number;
  productName: string;
  description: string;
  price: string;
  image: string;
  category: string;
  marketplace: string;
  productUrl: string;
  stock: number;
  stockStatus: 'In Stock' | 'Out of Stock';
  createdAt: string;
  updatedAt: string;
};
