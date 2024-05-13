import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { Auth, getAuth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { signInAnonymously } from '@firebase/auth';



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
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginData = this.formBuilder.group({
    email: '',
    password: '',
  })



  logInFalse = false;


  constructor(
    private formBuilder: FormBuilder,
    public authservice: AuthService,
    private auth: Auth,
    private firebase: Firestore,
    private router: Router,
  ) { }


  async logIn(event: Event) {
    let email = this.loginData.value.email || '';
    let password = this.loginData.value.password || '';
    event.preventDefault();
    let logInSuccess = await this.authservice.signIn(email, password);
    if (logInSuccess) {
      this.logInFalse = false;
      this.router.navigate(['/dashboard/']);
    } else {
      this.logInFalse = true;
      console.log('Anmeldung fehlgeschlagen');
    }
  }

  async guestLogin() {
    const auth = getAuth();
    signInAnonymously(auth)
      .then(() => {
        console.log(auth);
        
        this.router.navigate(['/dashboard/']);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }

  // async signIn(email: string, password: string) {
  //   try {
  //     const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
  //     return userCredential.user;
  //   } catch (error) {
  //     return null;
  //   }
  // }

  // signInWidthGoogle() {
  //   this.authservice.signInWidthGoogle();
  // }
}
