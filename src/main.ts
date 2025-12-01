import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/pages/app.component';
import { appConfig } from './app/pages/app.config';

import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

import { LOCALE_ID } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';

registerLocaleData(localePt);

const configWithLocale = {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),

    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
  ],
};

bootstrapApplication(AppComponent, configWithLocale).catch((err) => {
  console.error('Erro ao inicializar a aplicação:', err);
});
