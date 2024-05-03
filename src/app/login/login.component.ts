import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';


import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
// import { getAuth, signInWithPopup } from '@angular/fire/auth';



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

  })


  
  constructor(
    private formBuilder: FormBuilder,
    private firebase: Firestore,
    private authservice: AuthService,
  ) { }


  logIn(event: Event) {
    console.log('log in', this.loginData.value);
    event.preventDefault()
  }

  guestLogin() {


  }

  // googleProvider = new GoogleAuthProvider();
  // googleAuth = getAuth();


  signInWidthGoogle() {
// this.authservice.signInWidthGoogle();
    const googleProvider = new GoogleAuthProvider();
    const googleAuth = getAuth();

    signInWithPopup(googleAuth, googleProvider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
          const token = credential.accessToken;
          const user = result.user;
        }
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  }
}
