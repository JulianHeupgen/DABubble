import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  registerForm: FormGroup;

  constructor(private authservice: AuthService, private formBuilder: FormBuilder) {
    this.registerForm = this.formBuilder.group({
      fullname: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+ [a-zA-Z]+$')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      privacy: ['', Validators.requiredTrue],
    });
  }

  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.registerForm.value);
    this.registerForm.reset();
  }

  registerUser() {
    this.authservice.signUp('hannes@dabubble.com', '123456789')
      .then(user => {
        console.log(user);
      })
      .catch(error => {
        console.error('An error occured while signin up the user. ERR CODE: ', error);
      })
  }

  // Just as test
  loginUser() {
    this.authservice.signIn('hannes@dabubble.com', '123456789')
      .then(user => {
        console.log(user.user);
      })
      .catch(error => {
        console.error('An error happened while signin in. ERR CODE: ', error.code);
      })
  }

}
