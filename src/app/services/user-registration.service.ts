import {Injectable} from '@angular/core';
import {StorageService} from "./storage.service";
import {AuthService} from "./auth.service";
import {User} from "../models/user.class";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class UserRegistrationService {

  private _userData: any;

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private router: Router
  ) {
  }

  // Needed to save the object without restrictions on the model
  saveUserData(data: any) {
    this._userData = data;
  }

  // Get user date for next step on registration process
  getUserFullName(): any {
    if (this._userData) {
      return this._userData.fullname;
    }
  }

  clearUserData(): void {
    this._userData = {};
  }

  async uploadFile(file: File) {
    if (file && file instanceof File) {
      try {
        return await this.storageService.uploadFile(file);
      } catch (error) {
        console.error('Image upload error. ', error);
      }
    }
    return null;
  }

  updateUserObject(key: string, data: string | string[]) {
    this._userData = {...this._userData, [key]: data};
  }

  signUpAndCreateUser() {
    // first we sign up the user
    this.authService.signUp(this._userData.email, this._userData.password)
      .then(user => {
        //update the firebase user model with the auth id and store it
        this.updateUserObject('authUserId', user.user.uid);
        this.removePasswordFromUserObject();
        return this.saveFirebaseUser();
      })
      .then(() => {
        console.log('User created with success.')
      })
      .catch(error => {
        console.error('An error occurred while sign in up the user. Error: ', error);
      })
  }

  removePasswordFromUserObject() {
    if (this._userData.password) {
      delete this._userData.password;
    }
  }

  async saveFirebaseUser() {
    const user = new User(this._userData);
    // Connect firebase and set Doc User HERE
    await this.saveUserToFirebase(user)
      .then(() => {
        this.router.navigate(['dashboard']);
      })
      .catch((error) => {
        console.error('Error saving user to firebase. ', error);
      })
  }

  async saveUserToFirebase(user: User) {
    try {
      await this.authService.createFirebaseUser(user);
    } catch (error) {
      console.error('Error after saving user to firebase: ', error);
    }
  }
}
