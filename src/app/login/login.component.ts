import { Component } from '@angular/core';
<<<<<<< HEAD
import { Router } from '@angular/router';
=======
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
>>>>>>> af869858aeefe069ed80182e65f3ffab38be2189

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
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

<<<<<<< HEAD
  constructor(private router: Router) {}

  goToDashboard() {
    this.router.navigateByUrl('/dashboard');
  }

=======
  loginData = this.formBuilder.group({
    name: '',
    email: '',
  })


  constructor(private formBuilder: FormBuilder) { }

  logIn(event: Event) {
    console.log('log in', this.loginData.value);
    event.preventDefault();
    
}

guestLogin() {
    console.log('Gast Login');
    
}
>>>>>>> af869858aeefe069ed80182e65f3ffab38be2189
}
