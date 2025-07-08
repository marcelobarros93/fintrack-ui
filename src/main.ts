import {
  enableProdMode,
  DEFAULT_CURRENCY_CODE,
  LOCALE_ID,
  importProvidersFrom,
} from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { ToastModule } from 'primeng/toast';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { FormBuilder } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DatePipe, CommonModule, registerLocaleData } from '@angular/common';
import { AuthInterceptor } from './app/auth.interceptor';
import {
  HTTP_INTERCEPTORS,
  withInterceptorsFromDi,
  provideHttpClient,
} from '@angular/common/http';

import localePt from '@angular/common/locales/pt';
import { provideRouter } from '@angular/router';
import { APP_ROUTES } from './app/app.routes';

if (environment.production) {
  enableProdMode();
}

registerLocaleData(localePt, 'pt-BR');

bootstrapApplication(AppComponent, {
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
}).catch((err) => console.error(err));
