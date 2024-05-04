import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';



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

  email = this.loginData.value.email || '';
  password = this.loginData.value.password || '';

  logInFalse = false;


  constructor(
    private formBuilder: FormBuilder,
    private authservice: AuthService,
    private auth: Auth,
    private firebase: Firestore,
    private router: Router,
  ) { }


  async logIn(event: Event) {    
    event.preventDefault();
    let logInSuccess = await this.signIn(this.email, this.password);
    if (logInSuccess) {
      this.logInFalse = false;
      this.router.navigate(['/dashboard/',logInSuccess.uid]);
    } else {
      this.logInFalse = true;
      console.log('Anmeldung fehlgeschlagen');      
    }
  }

  async guestLogin() {
    let logInSuccess = await this.signIn('guest@guest.com', '123456');
    console.log('guest login', logInSuccess);
    if (logInSuccess) {
      this.router.navigate(['/dashboard/',logInSuccess.uid]);
    } else {
      console.log('Anmeldung fehlgeschlagen');      
    }
  }

  async signIn(email: string, password: string) {   
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      return null;
    }
  }

  signInWidthGoogle() {
    this.authservice.signInWidthGoogle();
  }
}
