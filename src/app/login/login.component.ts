import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Firestore } from '@angular/fire/firestore';

import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { signInWithCredential } from '@angular/fire/auth';
// import { getAuth } from "firebase/auth";
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {



  loginData = this.formBuilder.group({
    email: '',
    password: '',

    // firebase = require('firebase');
    // firebaseUi = require('firebaseui');
  })


  constructor(private formBuilder: FormBuilder, firebase: Firestore) {

  }

  logIn(event: Event) {
    console.log('log in', this.loginData.value);
    event.preventDefault();
    this.logInWithGoogle();
  }

  logInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
          const token = credential.accessToken;
          const user = result.user;
          // ...
        }

      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  
  }

  guestLogin() {
    console.log('Gast Login');
  }
}
