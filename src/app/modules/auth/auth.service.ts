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

interface AccessTokenPayload {
  userName?: string;
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

  getUserName(): string | null {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return null;
    }

    const payload = this.decodeJwtPayload<AccessTokenPayload>(accessToken);
    const userName = payload?.userName?.trim();

    return userName || null;
  }

  logout(): void {
    globalThis.localStorage.clear();
  }

  private decodeJwtPayload<T>(token: string): T | null {
    const tokenParts = token.split('.');
    if (tokenParts.length < 2) {
      return null;
    }

    try {
      const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        '='
      );
      const decoded = globalThis.atob(paddedBase64);
      const normalized = decodeURIComponent(
        Array.from(decoded)
          .map((character) =>
            `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`
          )
          .join('')
      );

      return JSON.parse(normalized) as T;
    } catch {
      return null;
    }
  }
}
