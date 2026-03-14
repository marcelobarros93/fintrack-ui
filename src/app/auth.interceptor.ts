import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './modules/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const isPublicAuthRequest =
      request.url.endsWith('/auth/login') ||
      request.url.endsWith('/users/register');

    if (isPublicAuthRequest) {
      return next.handle(request);
    }

    const accessToken = this.authService.getAccessToken();

    // Clone the request and set the Authorization header
    const authRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Pass the modified request to the next handler
    return next.handle(authRequest);
  }
}
