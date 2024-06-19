import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { getAuth, sendPasswordResetEmail } from '@angular/fire/auth';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-send-mail-to-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './send-mail-to-reset-password.component.html',
  styleUrl: './send-mail-to-reset-password.component.scss',
  animations: [
    trigger('emailBanner', [
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
export class SendMailToResetPasswordComponent {

  logInFalse: boolean = false;
  bannerState = '';

  /**
   * creates an instance of SendMailToResetPasswordComponent
   * @param formBuilder - the form builder service
   * @param router - the router service
   */
  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  emailData = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  })

  /**
   * send an email for password reset
   * show banner for success
   * navigate back to login
   */
  async sendEmailResetPassword(): Promise<void> {
    if (this.emailData.valid) {
      const auth = getAuth();
      const email: string = this.emailData.value.email || '';

      sendPasswordResetEmail(auth, email)
        .then(() => {
          this.bannerState = 'showBanner';
          setTimeout(() => {
            this.bannerState = 'fadeUp';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 1000);
          }, 500);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          // ..
        });
    }
  }
}
