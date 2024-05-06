import { Component } from '@angular/core';
import { UserRegistrationService } from '../services/user-registration.service';
import { AuthService } from '../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-photo-selection',
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
  templateUrl: './photo-selection.component.html',
  styleUrl: './photo-selection.component.scss'
})
export class PhotoSelectionComponent {

  user: any;
  // PROD -> empty Object
  userData: any = {
    "fullname": "Max Mustermann",
    "email": "max@mustermann.com",
    "password": "123456789",
    "privacy": true
  };


  defaultAvatars: string[] = [
    './../../assets/img/avatar_1.png',
    './../../assets/img/avatar_2.png',
    './../../assets/img/avatar_3.png',
    './../../assets/img/avatar_4.png',
    './../../assets/img/avatar_5.png',
    './../../assets/img/avatar_6.png'
  ];

  imageUrl: string | ArrayBuffer | null = './../../assets/img/profile-empty.png';
  imageName: string = '';
  imageSelected: boolean = false;
  uploadedFile: File | null = null;

  constructor(
    private userRegService: UserRegistrationService,
    private authService: AuthService,
    private storageService: StorageService
  ) {
    // PROD -> uncomment line below
    // this.userData = this.userRegService.getUserData();
  }

  async onRegistrationFinished() {

    if (this.uploadedFile instanceof File) {
      const downloadUrl = await this.storageService.uploadFile(this.uploadedFile);
      console.log('Get your file here: ', downloadUrl);
    }

    // return;

    // PROD
    this.authService.signUp(this.userData.email, this.userData.password, this.userData.fullname)
      .then(user => {
        this.user = user;
        console.log(user);
      })
      .catch(error => {
        console.error('An error occured while signin up the user. ERR CODE: ', error);
      })
  }

  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    const file = element.files ? element.files[0] : null;


    if (file) {
      this.imageName = file.name;
      this.uploadedFile = file;
      const reader = new FileReader;

      reader.onload = () => {
        this.imageUrl = reader.result;
        this.imageSelected = true;
        element.value = '';
      }

      reader.onerror = () => {
        console.error('Error occurred reading file');
      }

      reader.readAsDataURL(file);
    } else {
      element.value = '';
      this.imageSelected = false;
    }
  }

  onSelectedAvatar(avatarUrl: string): void {
    this.imageUrl = avatarUrl;
    console.log(this.imageUrl);

    this.imageSelected = true;
    this.imageName = '';
  }

}
