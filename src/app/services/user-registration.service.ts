import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserRegistrationService {

  private _userData: any;

  constructor() {}

  // Needed to save the object without restrictions on the model
  saveUserData(data: any) {
    this._userData = data;
  }

  // Get user date for next step on registration process
  getSavedUserData(): any {
    return this._userData;
  }

  clearUserData(): void {
    this._userData = {};
  }
}
