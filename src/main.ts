import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'


if (environment.production) {
  enableProdMode();
}

// Initialize the Firebase 1st before the loading of AppModule
firebase.initializeApp(environment.firebase)

let appInit = false

// Firebase properties to checked the user authentication.
firebase.auth().onAuthStateChanged(() => {
  // Firebase checked the initialization if it's initialized or not
  if(!appInit) {
    platformBrowserDynamic().bootstrapModule(AppModule)
      .catch(err => console.error(err));
  }
  // This tells that Firebase is done the initializing.
  // and it will load the AppModule.
  appInit = true
})


