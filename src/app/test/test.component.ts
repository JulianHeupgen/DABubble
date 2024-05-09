import { FormsModule } from '@angular/forms';
import { AuthService } from './../services/auth.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {

  constructor( private authService: AuthService ) {}

  email: string | null = '';
  newEmail: string = '';

  fullname: string | null = '';
  newFullname: string = '';

  needsReAuthenetication: boolean = false;

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.setEmail();
    this.setFullname();

    this.addNumbers(5,7, (message:string) => {
      console.log(message);
    })
  }

  addNumbers(a: number, b:number, callback: (result:string) => void): void {
    const result = a+b;
    if (result > 10) {
      callback('The sum is greater than 10');
    } else {
      callback('The sum is 10 or less');
    }
  }

  async setEmail() {
    try {
      this.email = await this.authService.getUserEmail();
    } catch (error) {
      console.error('Failed to get email. ', error);
      this.email = 'undefined';
    }
  }

  async setFullname() {
    try {
      const uid = await this.authService.getUserAuthId();
      if (uid) {
        this.fullname = await this.authService.getUserFullname(uid);
      }
    } catch (error) {
      console.error('Failed to get fullname. ', error);
      this.fullname = 'undefined';
    }
  }

  /**
   * Take this function to update users email address
   * TODO: Add Email validation before sending to update method to prevent firestore error warnings
   * @returns
   */
  async changeEmail() {
    if (!this.newEmail) { return; }
    try {
      await this.authService.updateEmailAddress(this.newEmail);
      console.log('Email sucessful changed.');
    } catch (error) {
      if (error instanceof Error && error.message === 'auth/requires-recent-login') {
        this.needsReAuthenetication = true;
      }
      console.error('Error while updating the email adress to auth and db.');
    }
  }


  /**
   * Take this function to update users fullname on firestore
   * @returns A log or an error log. In hope for just a log.
   */
  async changeFullname() {
    if (!this.newFullname) { return; }
    try {
      await this.authService.updateName(this.newFullname);
      console.log('Name successfull changed.');
    } catch (error) {
      console.error('Error while updating the name.');
    }
  }


}
