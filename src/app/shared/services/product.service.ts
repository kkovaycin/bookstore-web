import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../constants/api.constants';
import { Product } from '../interfaces/product.interface';
import { ProductRequest } from '../interfaces/product-request.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(API_ENDPOINTS.products);
  }

  searchProducts(
    name: string,
    categoryIds: number[],
  ): Observable<Product[]> {
    let params = new HttpParams();

    const normalizedName = name.trim();

    if (normalizedName) {
      params = params.set('name', normalizedName);
    }

    for (const categoryId of categoryIds) {
      params = params.append(
        'categoryIds',
        categoryId.toString(),
      );
    }

    return this.http.get<Product[]>(
      `${API_ENDPOINTS.products}/search`,
      { params },
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(
      `${API_ENDPOINTS.products}/${id}`,
    );
  }

  createProduct(
    request: ProductRequest,
  ): Observable<Product> {
    return this.http.post<Product>(
      API_ENDPOINTS.products,
      request,
    );
  }

  updateProduct(
    id: number,
    request: ProductRequest,
  ): Observable<Product> {
    return this.http.put<Product>(
      `${API_ENDPOINTS.products}/${id}`,
      request,
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(
      `${API_ENDPOINTS.products}/${id}`,
    );
  }
}
