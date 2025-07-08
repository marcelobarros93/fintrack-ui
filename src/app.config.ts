import { ApplicationConfig } from '@angular/core';
import {
  DEFAULT_CURRENCY_CODE,
  LOCALE_ID,
  importProvidersFrom,
} from '@angular/core';

import { ToastModule } from 'primeng/toast';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormBuilder } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DatePipe, CommonModule } from '@angular/common';
import { AuthInterceptor } from './app/auth.interceptor';
import {
  HTTP_INTERCEPTORS,
  withInterceptorsFromDi,
  provideHttpClient,
} from '@angular/common/http';

import { provideRouter } from '@angular/router';
import { APP_ROUTES } from './app/app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(BrowserModule, CommonModule, ToastModule),
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    DatePipe,
    MessageService,
    ConfirmationService,
    FormBuilder,
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(APP_ROUTES),
  ],
};
