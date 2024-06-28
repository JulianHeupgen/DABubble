import { Component } from '@angular/core';
import { MatButton } from "@angular/material/button";
import { MatCard, MatCardContent } from "@angular/material/card";
import { NgForOf, NgIf } from "@angular/common";
import { RouterLink } from "@angular/router";
import { PhotoSelectionComponent } from "../photo-selection/photo-selection.component";
import { UserRegistrationService } from "../services/user-registration.service";
import {defaultChannel} from "../default-data";

/**
 * @component RegisterNextComponent
 * This component handles the next step in the user registration process, including photo selection and final registration.
 */
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

  /**
   * Creates an instance of RegisterNextComponent.
   * @param {UserRegistrationService} userRegService - The user registration service.
   */
  constructor(private userRegService: UserRegistrationService) { }

  /**
   * Handles the selected file from the photo selection component.
   * @param {File | null} file - The selected file.
   * @memberof RegisterNextComponent
   */
  handleFile(file: File | null) {
    this.imageAsFileOrUrl = file;
  }

  /**
   * Handles the selected image (either file or URL) from the photo selection component.
   * @param {File | string} fileOrUrl - The selected image.
   * @memberof RegisterNextComponent
   */
  handleImage(fileOrUrl: File | string) {
    this.imageAsFileOrUrl = fileOrUrl;
  }

  /**
   * Completes the user registration process.
   * @memberof RegisterNextComponent
   */
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
      this.userRegService.updateUserObject('channels', [defaultChannel]);
      this.userRegService.signUpAndCreateUser();
    }
    catch (error) {
      console.error('An error occurred while saving the user.');
    }
  }

}
