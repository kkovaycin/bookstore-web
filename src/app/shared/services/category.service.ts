import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../constants/api.constants';
import { Category } from '../interfaces/category.interface';
import { CategoryRequest } from '../interfaces/category-request.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(API_ENDPOINTS.categories);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${API_ENDPOINTS.categories}/${id}`);
  }

  createCategory(request: CategoryRequest): Observable<Category> {
    return this.http.post<Category>(API_ENDPOINTS.categories, request);
  }

  updateCategory(id: number, request: CategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${API_ENDPOINTS.categories}/${id}`, request);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${API_ENDPOINTS.categories}/${id}`);
  }
}
