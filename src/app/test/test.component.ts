import { FormsModule } from '@angular/forms';
import { AuthService } from './../services/auth.service';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule, MatDialogClose } from '@angular/material/dialog';
import { ReAuthenticateUserComponent } from '../dialog/re-authenticate-user/re-authenticate-user.component';
import { Observable, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, MatDialogModule, MatDialogClose],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {

  constructor(
    private authService: AuthService,
    public dialog: MatDialog
  ) { }

  userAuthId!: string | null;
  users: any;

  // Actual values from firestore
  email: string | null = '';
  fullname: string | null = '';

  // New values from user input
  newEmail: string = '';
  newFullname: string = '';


  ngOnInit(): void {
    this.getUserAuthId();
    this.setEmail();
    this.setFullname();
    this.getUsers();
  }

  getUsers() {
    const subscription = this.authService.getUsersList().subscribe( value => console.log(value)
      /* {
      next(arr) {
        console.log('Subscription active');
        console.log(arr);
      },
      error(err) {
        console.error(err);
      }
    } */
  )
    setTimeout(() => {
      subscription.unsubscribe();
      console.log('unsubscribed');
    }, 15000);
  }


  async getUserAuthId() {
    try {
      this.userAuthId = await this.authService.getUserAuthId();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Open the login modal which is used for the reauthentification
   * @returns Login Form value as Promise
   */
  openLoginModal(source: string): Promise<any> {
    const dialogRef = this.dialog.open(ReAuthenticateUserComponent, {data: { from: source }});
    return firstValueFrom(dialogRef.afterClosed());
  }

  /**
   * Reauthenticates the user by email and password
   * Is needed for sensible firebase actions like updating email, password or delete whole user
   * @param email
   * @param password
   */
  async reAuthenticate(email: string, password: string) {
    try {
      await this.authService.reAuthenticateUser(email, password);
      console.log('User reauthenticated with success');
    } catch (error) {
      throw new Error('Couldnt authenticate the user.');
    }
  }

  /**
   * Deletes a User from Auth and from Firestore
   * Step 1. reAuthenticateUser(email: string, password: string)
   * Step 2. removeAuthUser()
   * Step 3. removeFirestoreUser()
   */
  async deleteUser() {
    try {
      const formData = await this.openLoginModal('User löschen');
      if (formData) {
        await this.reAuthenticate(formData.email, formData.password);
        // delete firestore user first as auth uid is needed to track the firestore user
        await this.authService.removeFirestoreUser();
        await this.authService.removeAuthUser();
        console.log('User deleted with success.');
      } else {
        console.log('Form data not provided');
      }
    } catch (error) {
      console.error('Error during deletion process: ', error);
    }
  }

  /**
   * Take this function to update users email address
   * Step 1. reAuthenticateUser(email: string, password: string)
   * Step 2. updateEmailAddress(newmail: string)
   *         this updates email on firestore and auth - rollback when needed
   * @returns
   */
  async changeEmail() {
    try {
      const formData = await this.openLoginModal('E-Mail ändern');
      if (formData) {
        await this.reAuthenticate(formData.email, formData.password);
        if (!this.newEmail) { return; }
        await this.authService.updateEmailAddress(this.newEmail);
        console.log('User Email updated with success.');
      } else {
        console.log('Form data not provided');
      }
    } catch (error) {
      console.error('Error during updating email process: ', error);
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
      console.error('Error while updating the name.', error);
    }
  }

  async setEmail() {
    try {
      this.email = await this.authService.getUserEmail();
    } catch (error) {
      console.warn('Failed to get Email. Please log in or register.');
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
      console.warn('Failed to get Fullname. Please log in or register.');
      this.fullname = 'undefined';
    }
  }



}
