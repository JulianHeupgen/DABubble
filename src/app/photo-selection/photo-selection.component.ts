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
import { User } from '../models/user.class';

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

  // this is used as reference for the new User model which will be upped to db
  userData: Partial<User> = {};
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
  imgSrcUrl: string | ArrayBuffer | null = './../../assets/img/profile-empty.png';

  //imageName: string = '';
  // Needed boolean to deactivate the next button
  imageSelected: boolean = false;

  // Image uploaded by the User Input field
  uploadedFile: File | null = null;

  constructor(
    private userRegService: UserRegistrationService,
    private authService: AuthService,
    private storageService: StorageService
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
        this.updateUserObject('userId' ,user.user.uid);
        this.updateUserObject('onlineStatus' , 'online');
        this.createUserObject();
      })
      .catch(error => {
        console.error('An error occured while signin up the user. ERR CODE: ', error);
      })
  }

  createUserObject() {
    const user = new User(this._userData);
    console.log('Created User Object with the _userData. user is: ', user);
    // Connect firebase and set Doc User HERE
  }

  updateUserObject(key: string, data: string) {
    this._userData = { ...this._userData, [key]: data };
  }

  async testfunc() {
    // Set User object which looks like this
    /* User {
        "name": "hgfd hgfdhgf",
        "email": "hgfd@sdfg.com",
        "onlineStatus": "online",
        "channels": [],
        "userChats": [],
        "userId": "unSemc7HgiXubBTz6qQ571oYCTn1",
        "imageUrl": "https://firebasestorage.googleapis.com/v0/b/da-bubble-4a31a.appspot.com/o/avatar_4.png?alt=media&token=d518661c-a6d0-4cbe-846a-8c7fcc072e98"
    } */
    console.log(this._userData);
  }

  // uploaded File
  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    const file = element.files ? element.files[0] : null;

    if (file) {
      //this.imageName = file.name;
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
    } else {
      element.value = '';
      this.imageSelected = false;
    }
  }

  // Selected Default Avatar
  onSelectedAvatar(avatarUrl: string): void {
    this.imgSrcUrl = avatarUrl;
    this.imageSelected = true;
    //this.imageName = '';
  }

}
