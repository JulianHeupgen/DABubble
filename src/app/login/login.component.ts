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
    public authService: AuthService,
    private auth: Auth,
    private router: Router,
  ) { }

  /**
   * login with email and password via firebase authentication
   * @param {Event} event 
   */
  async logIn(event: Event) {
    let email = this.loginData.value.email || '';
    let password = this.loginData.value.password || '';
    event.preventDefault();
    let logInSuccess = await this.authService.signIn(email, password);
    if (logInSuccess) {
      this.logInFalse = false;
      this.router.navigate(['/dashboard/']);
    } else {
      this.logInFalse = true;
      console.log('Anmeldung fehlgeschlagen');
    }
  }

  /**
   * login for guest
   */
  async guestLogin() {
    this.authService.signIn('max@mustermann.com', '123456')
      .then(() => {
        console.log('Guest signed in with sucess.');
        this.router.navigate(['/dashboard/']);
      })
      .catch(error => {
        console.warn('Could not sign up with the Guest User. Signing up with anonymous login. ');
        this.anonymousUserLogin();
      })
  }

  /**
   * Fallback method in case auth does not get Guest User - when for example deleted
   */
  anonymousUserLogin() {
    const auth = getAuth();
    signInAnonymously(auth)
      .then(() => {
        this.router.navigate(['/dashboard/']);
      })
      .catch((error) => {
        console.error('Could not sign up with guest account. ', error);
      });
  }
}
