import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { enableIndexedDbPersistence, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { Subscription } from 'rxjs';
import {firebaseConfig} from "./../environments/firebase.config";

export const appConfig: ApplicationConfig = {

  providers: [
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(provideFirebaseApp(() => initializeApp(firebaseConfig))),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideFirestore(() => getFirestore())),
    importProvidersFrom(provideStorage(() => getStorage())),

    // Test below - uncomment above line if fails
    /* importProvidersFrom(provideFirestore(() => {
      const firestore = getFirestore();
      enableIndexedDbPersistence(firestore);
      return firestore;
    })), */
  ]
};

