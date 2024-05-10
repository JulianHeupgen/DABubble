import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCommonModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { getAuth, sendPasswordResetEmail } from '@angular/fire/auth';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-send-mail-to-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './send-mail-to-reset-password.component.html',
  styleUrl: './send-mail-to-reset-password.component.scss'
})
export class SendMailToResetPasswordComponent {

  logInFalse: boolean = false;

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private dataService: DataService,
    private formBuilder: FormBuilder,
  ) { }

  emailData = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  })

  ngOnInit() {
    // this.getIdFromMail();
    // this.sendEmailResetPassword('janhorstmann@yahoo.de');
  }

  async getIdFromMail() {
    const querySnapshot = await getDocs(this.dataService.getUserCollection());
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data()['email']);
    });
  }

  mailForResetPassword() {

  }

  async sendEmailResetPassword(): Promise<void> {
    if (this.emailData.valid) {
      const auth = getAuth();
      const email: string = this.emailData.value.email || '';
      console.log('E-Mail:', email);

      sendPasswordResetEmail(auth, email)
        .then(() => {
          // Password reset email sent!
          // ..
          console.log('Password reset email sent!', auth);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          // ..
        });
    }
  }
}
