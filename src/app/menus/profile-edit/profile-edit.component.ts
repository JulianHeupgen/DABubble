import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {User} from '../../models/user.class';
import {Subscription, firstValueFrom} from 'rxjs';
import {CommonModule} from '@angular/common';
import {HeaderProfileService} from '../../services/header-profile.service';
import {ReAuthenticateUserComponent} from '../../dialog/re-authenticate-user/re-authenticate-user.component';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {SnackBarService} from '../../services/snack-bar.service';
import {PhotoSelectionComponent} from "../../photo-selection/photo-selection.component";
import {UserRegistrationService} from "../../services/user-registration.service";
import {StorageService} from "../../services/storage.service";
import {MatIcon} from "@angular/material/icon";

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
    private router: Router,
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
      // Get the actual image
      const user: any = await this.auth.getUserDoc();
      const oldImageUrl = user.imageUrl;
      // Set new image with storageUrl, then delete old image from storage
      try {
        await this.auth.updateFirebaseUser({imageUrl: storageUrl});
        this.storage.deleteFile(oldImageUrl);
        this.snackbar.showSnackBar('Photo changed successful. ', 'Ok');
        this.dialogRef?.close();
      } catch {
        console.error('Error while updating image');
      }
    } catch (error) {
      console.error('An error occurred while saving the user.', error);
    }
  }

  /**
   * Performs action on form submit
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
   * Checks for differences between two values
   * @param newVal
   * @param actualVal
   * @returns boolean if values are different
   */
  isDifferent(newVal: string, actualVal: any): string | null {
    return newVal !== actualVal ? newVal : null;
  }

  isDifferentBool(newVal: string, actualVal: any): boolean {
    return newVal !== actualVal;
  }

  hasNewFormValue() {
    const emailCtrl = this.editUserForm.get('email')?.value;
    const nameCtrl = this.editUserForm.get('name')?.value;

    const isEmailDiff = this.isDifferentBool(this.user.email, emailCtrl);
    const isNameDiff = this.isDifferentBool(this.user.name, nameCtrl);

    return isEmailDiff || isNameDiff;
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
        if (!newEmail) {
          return
        }
        await this.auth.updateAuthUserEmail(newEmail);
        await this.auth.updateFirebaseUser({email: newEmail});
        this.snackbar.showSnackBar('E-Mail geändert.');
        console.log('User Email updated with success.');
      } else {
        console.log('Form data not provided');
      }
    } catch (error) {
      this.snackbar.showSnackBar('Ein Fehler ist aufgetreten. Bitte versuchen sie es noch ein mal.');
      console.error('Error during updating email process: ', error);
    }
  }

  /**
   * Open the login modal which is used for the reauthentification
   * @returns Login Form value as Promise
   */
  openLoginModal(source: string): Promise<any> {
    const dialogRef = this.dialog.open(ReAuthenticateUserComponent, {data: {from: source}});
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
  async changeFullname(fullname: string) {
    if (!fullname) {
      return
    }
    try {
      await this.auth.updateFirebaseUser({name: fullname});
      this.snackbar.showSnackBar('Name geändert.');
      console.log('Name changed successful.');
    } catch (error) {
      this.snackbar.showSnackBar('Ein fehler ist aufgetreten. Bitte wiederholen sie es noch ein mal.');
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
    this.profileService.switchToMenu();
  }

  closeToView(event: Event) {
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
