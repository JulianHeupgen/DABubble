import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserRegistrationService {

  private userData: any = {};

  constructor() { }

  setUserData(data: any) {
    this.userData = {...this.userData, ...data};
  }

  getUserData(): any {
    return this.userData;
  }

  clearUserData(): void {
    this.userData = {};
  }
}
