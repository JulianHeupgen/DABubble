import { FormsModule } from '@angular/forms';
import { AuthService } from './../services/auth.service';
import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule, MatDialogClose } from '@angular/material/dialog';
import { ReAuthenticateUserComponent } from '../dialog/re-authenticate-user/re-authenticate-user.component';
import { Subscription, firstValueFrom } from 'rxjs';
import { User } from '../models/user.class';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, MatDialogModule, MatDialogClose],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})


export class TestComponent {

  /**
   * This Event listener sets the user onlineStatus
   * UPDATE: update Model - away when only doc.hidden and offline when no auth object
   * @param event
   */
  @HostListener('document:visibilitychange', ['$event'])
  onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      this.authService.updateFirebaseUser({ onlineStatus: 'online' });
    } else if (document.visibilityState === 'hidden') {
      this.authService.updateFirebaseUser({ onlineStatus: 'away' });
    }
  }

  constructor(
    private authService: AuthService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  date: number = 0;

  userAuthId!: string | null;
  users: User[] | undefined;
  user: User | undefined;

  // New values from user input
  newEmail: string = '';
  newFullname: string = '';

  private usersSub: Subscription = new Subscription();
  private userSub: Subscription = new Subscription();


  ngOnInit(): void {
    // one time getter
    this.getUserAuthId();

    // observable streams
    this.getUsers();
    this.getUser();

    this.date = new Date().getTime();
  }

  async logoutUser() {
    try {
      await this.authService.updateFirebaseUser({ onlineStatus: 'offline' });
      const tryLogout = await this.authService.logout();
      if (tryLogout === true) {
        this.router.navigate(['/login']);
      }
      console.log('User logged out.');
    } catch (error) {
      console.error(error);
    }
  }

  getUsers() {
    this.usersSub = this.authService.getUsersList().subscribe({
      next: (users) => this.users = users,
      error: (err) => console.error('Falied to fetch Users List. ', err)
    });
  }

  getUser() {
    //this.userSub = this.authService.getUser().subscribe(user => this.user = user);
    this.userSub = this.authService.getUser().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (err) => console.error('Failed to fetch user: ', err)
    });
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
    const dialogRef = this.dialog.open(ReAuthenticateUserComponent, { data: { from: source } });
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
        await this.authService.updateFirebaseUser({email: this.newEmail});
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
      await this.authService.updateFirebaseUser({name: this.newFullname});
      console.log('Name successfull changed.');
    } catch (error) {
      console.error('Error while updating the name.', error);
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.usersSub.unsubscribe();
    this.userSub.unsubscribe();
  }

}
