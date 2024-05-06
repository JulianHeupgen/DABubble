import { Component } from '@angular/core';
import { UserRegistrationService } from '../services/user-registration.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-photo-selection',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './photo-selection.component.html',
  styleUrl: './photo-selection.component.scss'
})
export class PhotoSelectionComponent {

  userData: any = {};
  user: any;

  constructor(
    private userRegService: UserRegistrationService,
    private authService: AuthService
  ) {
    this.userData = this.userRegService.getUserData();
  }

  onRegistrationFinished() {
    this.authService.signUp(this.userData.email, this.userData.password, this.userData.fullname)
      .then(user => {
        this.user = user;
        console.log(user);
      })
      .catch(error => {
        console.error('An error occured while signin up the user. ERR CODE: ', error);
      })
  }

}
