import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';

import localePt from '@angular/common/locales/pt';
import { appConfig } from './app.config';
import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';

if (environment.production) {
  enableProdMode();
}

registerLocaleData(localePt, 'pt-BR');

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
