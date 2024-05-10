import { FormsModule } from '@angular/forms';
import { AuthService } from './../services/auth.service';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../services/data.service';
import { Subscription } from 'rxjs';
import { User } from '../models/user.class';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {
  @ViewChild('eMail') emailInput!: ElementRef<HTMLInputElement>
  @ViewChild('password') passwordInput!: ElementRef<HTMLInputElement>

  constructor(
    private authService: AuthService,
    private data: DataService
  ) { }

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
  }

  async deleteUser() {
    const email = this.emailInput.nativeElement.value;
    const password = this.passwordInput.nativeElement.value;
    if (email && password) {
      try {
       // await this.authService.removeUser(email, password);       Vorsicht: Fehlermeldung, daher auskommentiert !!
        console.log('User deleted');
      } catch (error) {
        console.error(error);
      }
    }
  }

  async getUsers() {
    console.log(this.data.allUsers);
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
    const email = this.emailInput.nativeElement.value;
    const password = this.passwordInput.nativeElement.value;

    if (!this.newEmail) { return }

    try {
     // await this.authService.updateEmailAddress(this.newEmail, email, password);     Vorsicht, Fehlermeldung; daher auskommentiert
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
