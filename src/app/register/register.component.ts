import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserRegistrationService } from '../services/user-registration.service';
import { Router, RouterModule } from '@angular/router';

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
    MatCheckboxModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrls: [
    './register.component.scss'
  ]
})
export class RegisterComponent {

  //TODO
  // check email if already in use before next step redirect- otherwise error comes up on next page

  registerForm: FormGroup;
  userId = '';
  constructor(
    private authservice: AuthService,
    private formBuilder: FormBuilder,
    private userRegService: UserRegistrationService,
    private route: Router,
    private location: Location
  ) {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+ [a-zA-Z]+$')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      privacy: ['', Validators.requiredTrue],
    });
  }

  goBack() {
    this.location.back();
  }

  async onNextStep() {
    const { privacy, ...userData } = this.registerForm.value;
    this.userRegService.saveUserData(userData);
    this.registerForm.reset();
    this.route.navigate(['/register/next']);
  }


  // REMOVE those for PROD
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
