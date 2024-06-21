import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.class';
import { Subscription, firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HeaderProfileService } from '../../services/header-profile.service';
import { ReAuthenticateUserComponent } from '../../dialog/re-authenticate-user/re-authenticate-user.component';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SnackBarService } from '../../services/snack-bar.service';
import { PhotoSelectionComponent } from "../../photo-selection/photo-selection.component";
import { UserRegistrationService } from "../../services/user-registration.service";
import { StorageService } from "../../services/storage.service";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatDialogModule, MatIcon],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss'
})
export class ProfileEditComponent {

  editUserForm: FormGroup;
  selectedImageAsFileOrUrl: File | string = '';
  user!: User;

  dialogRef?: MatDialogRef<PhotoSelectionComponent>;

  private userSub = new Subscription();

  constructor(
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private profileService: HeaderProfileService,
    public dialog: MatDialog,
    private snackbar: SnackBarService,
    private userRegService: UserRegistrationService,
    private storage: StorageService
  ) {
    this.editUserForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+ [a-zA-Z]+$')]]
    });
    this.getUser();
  }

  /**
   * Opens a dialog for image selection and updates the selected image.
   */
  openImageUploaderDialog() {
    const dialogRef = this.dialog.open(PhotoSelectionComponent, {
      data: {
        showClose: true,
        showBackArrow: false,
        buttonText: 'Speichern',
        onNext: this.onSelectedImage.bind(this)
      }
    });
    dialogRef.componentInstance.selectedImg.subscribe((image: File | string) => {
      this.selectedImageAsFileOrUrl = image;
    })
    this.dialogRef = dialogRef;
  }

  /**
   * Handles the selected image and updates the user's profile picture.
   */
  async onSelectedImage() {
    try {
      let storageUrl: string = '';
      if (this.selectedImageAsFileOrUrl instanceof File) {
        storageUrl = await this.userRegService.uploadFile(this.selectedImageAsFileOrUrl);
      } else if (this.selectedImageAsFileOrUrl.trim() !== '') {
        storageUrl = this.selectedImageAsFileOrUrl;
      } else {
        console.error('Invalid image URL');
        return;
      }
      const user: any = await this.auth.getUserDoc();
      const oldImageUrl = user.imageUrl;
      try {
        await this.auth.updateFirebaseUser({ imageUrl: storageUrl });
        this.storage.deleteFile(oldImageUrl);
        this.snackbar.showSnackBar('Photo changed successfully.', 'Ok');
        this.dialogRef?.close();
      } catch {
        console.error('Error while updating image');
      }
    } catch (error) {
      console.error('An error occurred while saving the user.', error);
    }
  }

  /**
   * Saves the changes to the user profile.
   */
  async save() {
    const newName = this.isDifferent(this.editUserForm.get('name')?.value, this.user.name);
    const newEmail = this.isDifferent(this.editUserForm.get('email')?.value, this.user.email);
    try {
      if (newName) {
        await this.changeFullname(newName);
      }
      if (newEmail) {
        await this.changeEmail(newEmail);
      }
    } catch (error) {
      console.error('Error updating the user. ', error);
    }
  }

  /**
   * Checks for differences between two values.
   * @param newVal - The new value.
   * @param actualVal - The actual value.
   * @returns A string if values are different, otherwise null.
   */
  isDifferent(newVal: string, actualVal: any): string | null {
    return newVal !== actualVal ? newVal : null;
  }

  /**
   * Checks if two values are different.
   * @param newVal - The new value.
   * @param actualVal - The actual value.
   * @returns A boolean indicating if the values are different.
   */
  isDifferentBool(newVal: string, actualVal: any): boolean {
    return newVal !== actualVal;
  }

  /**
   * Checks if the form has new values.
   * @returns A boolean indicating if there are new form values.
   */
  hasNewFormValue() {
    const emailCtrl = this.editUserForm.get('email')?.value;
    const nameCtrl = this.editUserForm.get('name')?.value;

    const isEmailDiff = this.isDifferentBool(this.user.email, emailCtrl);
    const isNameDiff = this.isDifferentBool(this.user.name, nameCtrl);

    return isEmailDiff || isNameDiff;
  }

  /**
   * Updates the user's email address.
   * @param newEmail - The new email address.
   */
  async changeEmail(newEmail: string) {
    try {
      const formData = await this.openLoginModal('E-Mail ändern');
      if (formData) {
        await this.reAuthenticate(formData.email, formData.password);
        if (!newEmail) {
          return;
        }
        await this.auth.updateAuthUserEmail(newEmail);
        await this.auth.updateFirebaseUser({ email: newEmail });
        this.snackbar.showSnackBar('E-Mail geändert.');
        console.log('User Email updated successfully.');
      } else {
        console.log('Form data not provided');
      }
    } catch (error) {
      this.snackbar.showSnackBar('Ein Fehler ist aufgetreten. Bitte versuchen sie es noch ein mal.');
      console.error('Error during updating email process: ', error);
    }
  }

  /**
   * Opens the login modal for re-authentication.
   * @param source - The source of the request.
   * @returns The form value as a promise.
   */
  openLoginModal(source: string): Promise<any> {
    const dialogRef = this.dialog.open(ReAuthenticateUserComponent, { data: { from: source } });
    return firstValueFrom(dialogRef.afterClosed());
  }

  /**
   * Re-authenticates the user by email and password.
   * @param email - The user's email.
   * @param password - The user's password.
   */
  async reAuthenticate(email: string, password: string) {
    try {
      await this.auth.reAuthenticateUser(email, password);
      console.log('User reauthenticated successfully');
    } catch (error) {
      throw new Error('Couldn\'t authenticate the user.');
    }
  }

  /**
   * Updates the user's full name.
   * @param fullname - The new full name.
   */
  async changeFullname(fullname: string) {
    if (!fullname) {
      return;
    }
    try {
      await this.auth.updateFirebaseUser({ name: fullname });
      this.snackbar.showSnackBar('Name geändert.');
      console.log('Name changed successfully.');
    } catch (error) {
      this.snackbar.showSnackBar('Ein Fehler ist aufgetreten. Bitte versuchen sie es noch ein mal.');
      console.error('Error while updating the name.', error);
    }
  }

  /**
   * Subscribes to user data and patches the form values with new user data.
   */
  getUser() {
    this.userSub = this.auth.getUser().subscribe(user => {
      if (user) {
        this.user = user;
        this.updateFormValues();
      }
    });
  }

  /**
   * Closes the edit mode and switches to menu view.
   * @param event - The event triggering the close action.
   */
  closeEdit(event: Event) {
    event.stopPropagation();
    this.profileService.switchToMenu();
  }

  /**
   * Closes the edit mode and switches to view mode.
   * @param event - The event triggering the close action.
   */
  closeToView(event: Event) {
    event.stopPropagation();
    this.profileService.switchToView();
  }

  /**
   * Updates the form values with the user's current data.
   */
  updateFormValues() {
    this.editUserForm.patchValue({
      email: this.user.email,
      name: this.user.name
    });
  }

  /**
   * Unsubscribes from user data updates when the component is destroyed.
   */
  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
