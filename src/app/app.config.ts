import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(provideFirebaseApp(() => initializeApp({"projectId":"da-bubble-4a31a","appId":"1:554696271521:web:3320570cc3b6bf304032e0","storageBucket":"da-bubble-4a31a.appspot.com","apiKey":"AIzaSyCCR-gSsdDCnLuNQ2yXzL0EVQv_ch4Wyzk","authDomain":"da-bubble-4a31a.firebaseapp.com","messagingSenderId":"554696271521"}))),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideFirestore(() => getFirestore())),
    importProvidersFrom(provideStorage(() => getStorage()))
  ]
};
