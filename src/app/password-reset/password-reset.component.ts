import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';

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
  styleUrl: './password-reset.component.scss',
  animations: [
    trigger('resetBanner', [
      state('showBanner', style({
        opacity: 1,
      })),
      state('fadeUp', style({
        opacity: 1,
        bottom: '50%',
      })),
      transition('void => showBanner', [
        animate('0.1s')
      ]),
      transition('showBanner => fadeUp', [
        animate('0.3s')
      ])
    ])
  ]
})
export class PasswordResetComponent {

  passwordData!: FormGroup;
  bannerState = '';

  /**
   * create an instance of PasswordResetComponent
   * @param formBuilder - the form builder service
   * @param router - the router service
   * @param activatedRoute - receive information about the current route
   */
  constructor(
    private formBuilder: FormBuilder,
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
  /**
   * checks if passwords match
   * @param {FormGroup} group 
   */
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')!.value;
    const passwordRepeat = group.get('passwordRepeat')!.value;
    return password === passwordRepeat ? null : { mismatch: true };
  }

  /**
   * reset password and show banner
   * navigate back to login
   */
  async resetPassword() {
    if (this.passwordData.valid) {
      const newPassword = this.passwordData.value.password;
      const actionCode = this.activatedRoute.snapshot.queryParams['oobCode'];
      this.bannerState = 'showBanner';
      setTimeout(() => {
        this.bannerState = 'fadeUp';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      }, 500);
    }
  }
}
