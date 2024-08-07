import { environment } from './../../../environments/environment';
import { Income } from './income';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Pageable } from '../core/pageable';
import { Observable } from 'rxjs';
import { DatePipe } from '@angular/common';

export interface IncomeFilter extends Pageable {
  description?: string;
  status?: string[];
  dateDueStart?: Date;
  dateDueEnd?: Date;
  dateReceiptStart?: Date;
  dateReceiptEnd?: Date;
}

export interface IncomeListResponse {
  content: Income[];
  pageable: any;
  totalPages: number;
  size: 20;
  page: any;
}

@Injectable({
  providedIn: 'root',
})
export class IncomeService {
  private baseUrl = `${environment.apiUrl}/v1/incomes`;
  private dateFormat = 'yyyy-MM-dd';

  constructor(protected http: HttpClient, private datePipe: DatePipe) {}

  findByFilter(filter: IncomeFilter): Observable<IncomeListResponse> {
    let params = new HttpParams()
      .set('page', filter.page!)
      .set('size', filter.size!)
      .set('sort', 'description,asc');

    if (filter.description) {
      params = params.set('description', filter.description);
    }

    if (filter.dateDueStart) {
      params = params.set(
        'dateDueStart',
        this.datePipe.transform(filter.dateDueStart, this.dateFormat)!
      );
    }

    if (filter.dateDueEnd) {
      params = params.set(
        'dateDueEnd',
        this.datePipe.transform(filter.dateDueEnd, this.dateFormat)!
      );
    }

    if (filter.status && filter.status.length === 1) {
      params = params.set('status', filter.status[0]);
    }

    return this.http.get<IncomeListResponse>(this.baseUrl, {
      params: params,
    });
  }

  findById(id: number): Observable<Income> {
    return this.http.get<Income>(`${this.baseUrl}/${id}`);
  }

  create(income: Income): Observable<Income> {
    return this.http.post<Income>(`${this.baseUrl}`, income);
  }

  update(id: number, income: Income): Observable<Income> {
    return this.http.put<Income>(`${this.baseUrl}/${id}`, income);
  }

  receive(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/receipt`, {});
  }

  cancelReceipt(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/receipt`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
