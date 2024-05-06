import { Injectable } from '@angular/core';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class UserRegistrationService {

  /* private userData: User; */
  // Object to save the user data before saving
  private _userData: any;

  constructor() {
    /* this.userData = new User(); */
   }

  // This sets the data for the db new User Object
  /* setUserData(user: Partial<User>) {
    this.userData = new User({...this.userData, ...user});
  } */

  // Needed to save the object without restrictions on the model
  saveUserData(data: any) {
    this._userData = data;
  }

  /* getUserData(): User {
    return this.userData;
  } */

  // Get user date for next step on registration process
  getSavedUserData(): any {
    return this._userData;
  }

  clearUserData(): void {
    this._userData = {};
  }
}
