import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/v1/auth`;

  constructor(protected http: HttpClient) {}

  isLogged(): boolean {
    return !!globalThis.localStorage.getItem('accessToken');
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, {
      email,
      password,
    });
  }

  getAccessToken(): string | null {
    return globalThis.localStorage.getItem('accessToken');
  }

  logout(): void {
    globalThis.localStorage.clear();
  }
}
