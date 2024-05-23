import {Component} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {NgForOf, NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";
import {PhotoSelectionComponent} from "../photo-selection/photo-selection.component";
import {UserRegistrationService} from "../services/user-registration.service";

@Component({
  selector: 'app-register-next',
  standalone: true,
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    NgForOf,
    NgIf,
    RouterLink,
    PhotoSelectionComponent
  ],
  templateUrl: './register-next.component.html',
  styleUrl: './register-next.component.scss'
})
export class RegisterNextComponent {

  imageAsFileOrUrl: File | string | null = '';

  constructor(private userRegService: UserRegistrationService) {
  }

  handleFile(file: File | null) {
    this.imageAsFileOrUrl = file;
  }

  handleImage(fileOrUrl: File | string) {
    this.imageAsFileOrUrl = fileOrUrl;
  }

  async onRegistrationFinished() {
    try {
      let storageUrl: string = '';
      if (this.imageAsFileOrUrl instanceof File) {
        storageUrl = await this.userRegService.uploadFile(this.imageAsFileOrUrl);
      } else if (typeof this.imageAsFileOrUrl === 'string') {
        storageUrl = this.imageAsFileOrUrl;
      }
      this.userRegService.updateUserObject('imageUrl', storageUrl as string);
      this.userRegService.updateUserObject('onlineStatus', 'online');
      this.userRegService.updateUserObject('channels', ['Yk2dgejx9yy7iHLij1Qj']);
      this.userRegService.signUpAndCreateUser();
    }
    catch (error) {
      console.error('An error occurred while saving the user.')
    }
  }

}
