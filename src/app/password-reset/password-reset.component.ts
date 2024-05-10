import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


import { AuthService } from '../services/auth.service';
import { Auth, confirmPasswordReset} from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
    MatIcon,
  ],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent {

  passwordData!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authservice: AuthService,
    private auth: Auth,
    private firebase: Firestore,
    private router: Router,

    private activatedRoute: ActivatedRoute,
  ) {

    this.passwordData = this.formBuilder.group({
      password: ['', Validators.required],
      passwordRepeat: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')!.value;
    const passwordRepeat = group.get('passwordRepeat')!.value;
    return password === passwordRepeat ? null : { mismatch: true };
  }

  async resetPassword() {
    if (this.passwordData.valid) {
      const newPassword = this.passwordData.value.password;
      const actionCode = this.activatedRoute.snapshot.queryParams['oobCode'];
      confirmPasswordReset(this.auth, actionCode, newPassword)
      .then(() => {
        console.log('password is reseted');
        this.router.navigate(['login']);
      })
      .catch(() => {
        console.log('password is not reseted');
      })
    }
  }
}
