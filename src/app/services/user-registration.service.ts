import { Injectable } from '@angular/core';
import { StorageService } from "./storage.service";
import { AuthService } from "./auth.service";
import { User } from "../models/user.class";
import { Router } from "@angular/router";
import {SnackBarService} from "./snack-bar.service";
import {doc} from "@angular/fire/firestore";
import {defaultChannel} from "../default-data";

@Injectable({
  providedIn: 'root'
})
export class UserRegistrationService {

  private _userData: any;

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private router: Router,
    private snack: SnackBarService
  ) { }

  /**
   * Saves user data for the registration process.
   * @param data - The user data to be saved.
   */
  saveUserData(data: any) {
    this._userData = data;
  }

  /**
   * Gets the full name of the user from the saved data.
   * @returns The full name of the user.
   */
  getUserFullName(): any {
    if (this._userData) {
      return this._userData.fullname;
    }
  }

  /**
   * Clears the saved user data.
   */
  clearUserData(): void {
    this._userData = {};
  }

  /**
   * Uploads a file to Firebase Storage.
   * @param file - The file to be uploaded.
   * @returns A Promise that resolves with the file URL or an empty string if upload fails.
   */
  async uploadFile(file: File) {
    if (file && file instanceof File) {
      try {
        return await this.storageService.uploadFile(file);
      } catch (error) {
        console.error('Image upload error. ', error);
      }
    }
    return '';
  }

  /**
   * Updates the user data object with a new key-value pair.
   * @param key - The key to be updated.
   * @param data - The data to be updated.
   */
  updateUserObject(key: string, data: string | string[]) {
    this._userData = { ...this._userData, [key]: data };
  }

  /**
   * Signs up the user and creates a user document in Firestore.
   */
  signUpAndCreateUser() {
    // first we sign up the user with the Firebase Auth
    this.authService.signUp(this._userData.email, this._userData.password)
      .then(user => {
        // update the firebase user model with the auth id and store it
        this.updateUserObject('authUserId', user.user.uid);
        this.removePasswordFromUserObject();
        return this.saveFirebaseUser();
      })
      .then(() => {
        console.log('User created with success.');
      })
      .catch(error => {
        console.error('An error occurred while signing up the user. Error: ', error);
        if (error.code === 'auth/email-already-in-use') {
          this._userData = {};
          this.snack.showSnackBar('Email already in use.')
          setTimeout(() =>this.router.navigate(['/register']).then(), 1500);
        }
      });
  }

  /**
   * Removes the password from the user data object.
   */
  removePasswordFromUserObject() {
    if (this._userData.password) {
      delete this._userData.password;
    }
  }

  /**
   * Saves the user data to Firestore and navigates to the dashboard.
   * @returns A Promise that resolves when the user data is saved.
   */
  async saveFirebaseUser() {
    const user = new User(this._userData);
    await this.saveUserToFirebase(user)
      .then(() => {
        this.router.navigate(['dashboard']);
      })
      .catch((error) => {
        console.error('Error saving user to firebase. ', error);
      });
  }

  /**
   * Saves a user object to Firestore.
   * @param user - The user object to be saved.
   * @returns A Promise that resolves when the user object is saved.
   */
  async saveUserToFirebase(user: User) {
    try {
      const userRef = await this.authService.createFirebaseUser(user);
      const userId = userRef.id;
      await this.authService.updateFirebaseUser({'userChats': [{userChatId: userId}]});
      await this.authService.updateChannelParticipantsArray(userId, defaultChannel);
    } catch (error) {
      console.error('Error after saving user to firebase and updating channel: ', error);
    }
  }
}
