import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authBaseUrl = `${environment.apiUrl}/v1/auth`;
  private readonly userBaseUrl = `${environment.apiUrl}/v1/users`;

  constructor(protected http: HttpClient) {}

  isLogged(): boolean {
    return !!globalThis.localStorage.getItem('accessToken');
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authBaseUrl}/login`, {
      email,
      password,
    });
  }

  register(payload: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(
      `${this.userBaseUrl}/register`,
      payload
    );
  }

  getAccessToken(): string | null {
    return globalThis.localStorage.getItem('accessToken');
  }

  logout(): void {
    globalThis.localStorage.clear();
  }
}
