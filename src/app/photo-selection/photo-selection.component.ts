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
import { StorageService } from '../services/storage.service';
import { User } from '../models/user.class';
import { Router } from '@angular/router';

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
    MatCheckboxModule
  ],
  templateUrl: './photo-selection.component.html',
  styleUrl: './photo-selection.component.scss'
})
export class PhotoSelectionComponent {

  // this is used as reference for the new User model which will be upped to db
  _userData: any = {};

  defaultAvatars: string[] = [
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-4a31a.appspot.com/o/avatar_1.png?alt=media&token=76a558f3-7364-4591-8b0d-9084a608438d',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-4a31a.appspot.com/o/avatar_2.png?alt=media&token=c11604f5-49f6-4faf-b7c7-5e1795c67e12',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-4a31a.appspot.com/o/avatar_3.png?alt=media&token=8e57bc9d-29fd-4e99-aece-435a6edf761a',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-4a31a.appspot.com/o/avatar_4.png?alt=media&token=d518661c-a6d0-4cbe-846a-8c7fcc072e98',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-4a31a.appspot.com/o/avatar_5.png?alt=media&token=27617a09-956f-47c4-b96a-bedd411f6da1',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-4a31a.appspot.com/o/avatar_6.png?alt=media&token=c4962f78-c6cf-4d28-964b-ed104548d2da'
  ];

  // URL which is shown on the Card as selected image
  DEFAULT_IMG_SRC_URL: string = './../../assets/img/profile-empty.png';
  imgSrcUrl: string | ArrayBuffer | null = this.DEFAULT_IMG_SRC_URL;

  // Needed boolean to deactivate the next button
  imageSelected: boolean = false;

  // Image uploaded by the User Input field
  uploadedFile: File | null = null;

  filesize: number = 0;
  uploadErr: boolean = false;

  constructor(
    private userRegService: UserRegistrationService,
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this._userData = this.userRegService.getSavedUserData();
  }

  // On next button when picture has been set
  async onRegistrationFinished() {
    if (this.uploadedFile && this.uploadedFile instanceof File) {
      try {
        const downloadUrl = await this.storageService.uploadFile(this.uploadedFile);
        this.imgSrcUrl = downloadUrl;
      } catch (error) {
        console.error('Error when uploading to the db: ', error);
      }
    }
    this.updateUserObject('imageUrl', this.imgSrcUrl as string);
    // Authenticate User and when successfull add User Object to Firestore
    this.signUpAndCreateUser();
  }

  signUpAndCreateUser() {
    this.authService.signUp(this._userData.email, this._userData.password, this._userData.fullname)
      .then(user => {
        this.updateUserObject('authUserId', user.user.uid);
        this.updateUserObject('onlineStatus', 'online');
        this.createUserObject();
      })
      .catch(error => {
        console.error('An error occured while signin up the user. ERR CODE: ', error);
      })
  }

  createUserObject() {
    this.removePasswordFromUserObject();
    const user = new User(this._userData);
    // Connect firebase and set Doc User HERE
    this.saveUserToFirebase(user)
      .then(() => {
        this.router.navigate(['dashboard']);
      })
      .catch((error) => {
        console.error('Error saving user to firebase. ', error);
      })
  }

  removePasswordFromUserObject() {
    if (this._userData.password) {
      delete this._userData.password;
    }
  }

  async saveUserToFirebase(user: User) {
    try {
      await this.authService.createFirebaseUser(user);
    } catch (error) {
      console.error('Error after saving user to firebase: ', error);
    }
  }

  updateUserObject(key: string, data: string) {
    this._userData = { ...this._userData, [key]: data };
  }

  // uploaded File
  onFileSelected(event: Event): void {
    this.uploadErr = false;
    const element = event.target as HTMLInputElement;
    const file = element.files ? element.files[0] : null;
    if (file) {
      this.filesize = Math.round(file?.size / 1000);
      if (this.filesize > 500) {
        this.fileTooBig();
        return;
      }
      this.setFile(file, element);
    } else {
      element.value = '';
      this.imageSelected = false;
    }
  }

  fileTooBig() {
    this.imageSelected = false;
    this.uploadErr = true;
    this.imgSrcUrl = this.DEFAULT_IMG_SRC_URL;
  }

  setFile(file: File, element: HTMLInputElement) {
    this.uploadedFile = file;
    const reader = new FileReader;
    reader.onload = () => {
      this.imgSrcUrl = reader.result;
      this.imageSelected = true;
      element.value = '';
    }
    reader.onerror = () => {
      console.error('Error occurred reading file');
    }
    reader.readAsDataURL(file);
  }

  // Selected Default Avatar
  onSelectedAvatar(avatarUrl: string): void {
    this.imgSrcUrl = avatarUrl;
    this.imageSelected = true;
  }

  setUserObject() {
    return {
      name: this._userData.name,
      email: this._userData.email,
      onlineStatus: this._userData.onlineStatus,
      channels: this._userData.channels,
      userChats: this._userData.userChats,
      authUserId: this._userData.authUserId,
      imageUrl: this._userData.imageUrl
    }
  }

}
