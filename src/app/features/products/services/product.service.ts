import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { CreateProductRequest } from '../models/create-product-request.model';
import { Product } from '../models/product.model';
import { UpdateProductRequest } from '../models/update-product-request.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(API_ENDPOINTS.products);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${API_ENDPOINTS.products}/${id}`);
  }

  createProduct(request: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(API_ENDPOINTS.products, request);
  }

  updateProduct(id: number, request: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${API_ENDPOINTS.products}/${id}`, request);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.products}/${id}`);
  }
}
