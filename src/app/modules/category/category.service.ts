import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export type CategoryType = 'INCOME' | 'EXPENSE';

export interface CategoryCreateRequest {
  name: string;
  type: CategoryType;
}

export interface CategoryResponse {
  id: number;
  name: string;
  type: CategoryType;
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
}
