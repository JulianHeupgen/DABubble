import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.class';
import { Subscription, firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HeaderProfileService } from '../../services/header-profile.service';
import { ReAuthenticateUserComponent } from '../../dialog/re-authenticate-user/re-authenticate-user.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss'
})
export class ProfileEditComponent {

  editUserForm: FormGroup;

  user!: User;

  constructor(
    private auth: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private profileService: HeaderProfileService,
    public dialog: MatDialog
  ) {
    this.editUserForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+ [a-zA-Z]+$')]]
    });
    this.getUser();
  }

  private userSub = new Subscription();

  /**
   * Performs action on form submit
   */
  async save() {
    const newName = this.isDifferent(this.editUserForm.get('name')?.value, this.user.name);
    const newEmail = this.isDifferent(this.editUserForm.get('email')?.value, this.user.email);
    try {
      if (newEmail) {
        this.changeEmail(newEmail);
      }
      if (newName) {
        await this.changeFullname(newName);
      }
    } catch (error) {
      console.error('Error updating the user. ', error);
    }
  }


  /**
   * Checks for differences between two values
   * @param newVal
   * @param actualVal
   * @returns boolean if values are different
   */
  isDifferent(newVal: string, actualVal: string): string | null {
    return newVal !== actualVal ? newVal : null;
  }

  /**
   * Take this function to update users email address
   * Step 1. reAuthenticateUser(email: string, password: string)
   * Step 2. updateEmailAddress(newmail: string)
   *         this updates email on firestore and auth - rollback when needed
   * @returns
   */
  async changeEmail(newEmail: string) {
    try {
      const formData = await this.openLoginModal('E-Mail ändern');
      if (formData) {
        await this.reAuthenticate(formData.email, formData.password);
        if (!newEmail) { return }
        await this.auth.updateEmailAddress(newEmail);
        console.log('User Email updated with success.');
      } else {
        console.log('Form data not provided');
      }
    } catch (error) {
      console.error('Error during updating email process: ', error);
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
      await this.auth.reAuthenticateUser(email, password);
      console.log('User reauthenticated with success');
    } catch (error) {
      throw new Error('Couldnt authenticate the user.');
    }
  }

  /**
   * Take this function to update users fullname on firestore
   * @returns A log or an error log. In hope for just a log.
   */
  async changeFullname(name: string) {
    if (!name) { return }
    try {
      await this.auth.updateName(name);
      console.log('Name successfull changed.');
    } catch (error) {
      console.error('Error while updating the name.', error);
    }
  }

  /**
   * Subscribes to User data and patches the form values with new user data
   */
  getUser() {
    this.userSub = this.auth.getUser().subscribe(user => {
      if (user) {
        this.user = user;
        this.updateFormValues()
      }
    })
  }

  closeEdit(event: Event) {
    event.stopPropagation();
    this.profileService.switchToView();
  }

  updateFormValues() {
    this.editUserForm.patchValue({
      email: this.user.email,
      name: this.user.name
    });
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

}
