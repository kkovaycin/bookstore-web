import { environment } from '../../../environments/environment';

export const API_ENDPOINTS = {
  products: `${environment.apiUrl}/products`,
  categories: `${environment.apiUrl}/categories`,
  register: `${environment.apiUrl}/auth/register`,
} as const;
