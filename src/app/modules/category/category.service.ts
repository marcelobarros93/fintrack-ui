import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export type CategoryType = 'INCOME' | 'EXPENSE';

export interface CategoryCreateRequest {
  name: string;
  type: CategoryType;
}

export interface CategoryUpdateRequest {
  name: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  type: CategoryType;
  active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly baseUrl = `${environment.apiUrl}/v1/categories`;

  constructor(protected http: HttpClient) {}

  findByType(type: CategoryType): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(`${this.baseUrl}/type/${type}`);
  }

  findAll(): Observable<CategoryResponse[]> {
    return forkJoin([this.findByType('INCOME'), this.findByType('EXPENSE')]).pipe(
      map(([incomeCategories, expenseCategories]) =>
        [...incomeCategories, ...expenseCategories].sort((left, right) =>
          left.name.localeCompare(right.name)
        )
      )
    );
  }

  create(category: CategoryCreateRequest): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(this.baseUrl, category);
  }

  update(id: number, category: CategoryUpdateRequest): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(`${this.baseUrl}/${id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  toggleActive(id: number): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(`${this.baseUrl}/${id}/active`, {});
  }
}
