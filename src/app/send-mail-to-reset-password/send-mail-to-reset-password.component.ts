import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCommonModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-send-mail-to-reset-password',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './send-mail-to-reset-password.component.html',
  styleUrl: './send-mail-to-reset-password.component.scss'
})
export class SendMailToResetPasswordComponent {

  logInFalse: boolean = false;

}
