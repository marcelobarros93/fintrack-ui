import {
  enableProdMode,
  DEFAULT_CURRENCY_CODE,
  LOCALE_ID,
  importProvidersFrom,
} from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { ToastModule } from 'primeng/toast';
import { AppRoutingModule } from './app/app-routing.module';
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

if (environment.production) {
  enableProdMode();
}

registerLocaleData(localePt, 'pt-BR');

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      CommonModule,
      ToastModule
    ),
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
  ],
}).catch((err) => console.error(err));
