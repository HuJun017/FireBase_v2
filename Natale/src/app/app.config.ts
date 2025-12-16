import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideFirebaseApp } from '@angular/fire/app';
import { initializeApp } from 'firebase/app';
import { enviroment } from '../environment';
import { provideAuth } from '@angular/fire/auth';
import { getAuth } from 'firebase/auth';
import { provideFirestore } from '@angular/fire/firestore';
import { getFirestore } from 'firebase/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    provideFirebaseApp(() => initializeApp(enviroment.firebase)),

    provideAuth(() => getAuth()),

    provideFirestore(() => getFirestore()),
  ]
};
