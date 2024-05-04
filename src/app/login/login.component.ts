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
    private authservice: AuthService,
    private firebase: Firestore,
    private router: Router,
  ) { }


  logIn(event: Event) {
    console.log('log in', this.loginData.value);
    event.preventDefault()
  }

  guestLogin() {

  }

  signInWidthGoogle() {
    this.authservice.signInWidthGoogle();
  }
}
