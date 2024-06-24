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

/**
 * @component RegisterComponent
 * This component handles the user registration process.
 */
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

  registerForm: FormGroup;
  userId = '';

  /**
   * Creates an instance of RegisterComponent.
   * @param {FormBuilder} formBuilder - The form builder service.
   * @param {UserRegistrationService} userRegService - The user registration service.
   * @param {Router} route - The router service.
   */
  constructor(
    private formBuilder: FormBuilder,
    private userRegService: UserRegistrationService,
    private route: Router
  ) {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-ZäöüÄÖÜß]+ [a-zA-ZäöüÄÖÜß]+$')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      privacy: ['', Validators.requiredTrue],
    });
  }

  /**
   * Proceeds to the next step in the registration process.
   * @memberof RegisterComponent
   */
  async onNextStep() {
    const { privacy, ...userData } = this.registerForm.value;
    this.userRegService.saveUserData(userData);
    this.registerForm.reset();
    this.route.navigate(['/register/next']).then();
  }

}
