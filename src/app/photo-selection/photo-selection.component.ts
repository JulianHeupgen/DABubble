import { Component, EventEmitter, Inject, Input, Optional, Output } from '@angular/core';
import { UserRegistrationService } from '../services/user-registration.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule } from "@angular/router";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { defaultAvatars } from "../configuration/default-avatars";

/**
 * @component PhotoSelectionComponent
 * This component allows the user to select or upload a profile photo.
 */
@Component({
  selector: 'app-photo-selection',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    RouterModule
  ],
  templateUrl: './photo-selection.component.html',
  styleUrl: './photo-selection.component.scss'
})
export class PhotoSelectionComponent {

  @Input({ required: true }) showBackArrow: boolean = false;
  @Input({ required: true }) showClose: boolean = false;

  @Input({ required: true }) onNext?: () => void;

  @Input() buttonText: string = 'Weiter';

  @Output() selectedImg = new EventEmitter<File | string>();

  fullName: string = 'Full Name';
  defaultAvatars = defaultAvatars;

  DEFAULT_IMG_SRC_URL: string = './../../assets/img/profile-empty.png';
  imgSrcUrl: string | ArrayBuffer | null = this.DEFAULT_IMG_SRC_URL;

  imageSelected: boolean = false;

  uploadedFile: File | null = null;

  filesize: number = 0;
  uploadErr: boolean = false;

  /**
   * Creates an instance of PhotoSelectionComponent.
   * @param {UserRegistrationService} userRegService - The user registration service.
   * @param {MatDialogRef<PhotoSelectionComponent>} [dialogRef] - Optional reference to the dialog containing this component.
   * @param {any} [data] - Optional data passed to the dialog.
   */
  constructor(
    private userRegService: UserRegistrationService,
    @Optional() public dialogRef: MatDialogRef<PhotoSelectionComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: {
      showClose: boolean,
      showBackArrow: boolean,
      onNext?: () => void,
      buttonText: string
    }
  ) { }

  /**
   * Initializes the component.
   * @memberof PhotoSelectionComponent
   */
  ngOnInit(): void {
    this.fullName = this.userRegService.getUserFullName();
    if (this.data) {
      this.showClose = this.data.showClose;
      this.showBackArrow = this.data.showBackArrow;
      this.buttonText = this.data.buttonText;
      this.onNext = this.data.onNext;
    }
  }

  /**
   * Calls the next function provided via the onNext input.
   * @memberof PhotoSelectionComponent
   */
  handleNext() {
    if (this.onNext) {
      this.onNext();
    }
  }

  /**
   * Closes the dialog.
   * @param {Event} event - The event object.
   * @memberof PhotoSelectionComponent
   */
  closeDialog(event: Event) {
    event.stopPropagation();
    this.dialogRef.close();
  }

  /**
   * Handles file selection by the user.
   * @param {Event} event - The event object.
   * @memberof PhotoSelectionComponent
   */
  onSelectedFile(event: Event): void {
    this.uploadErr = false;
    const element = event.target as HTMLInputElement;
    const file = element.files ? element.files[0] : null;
    if (file) {
      this.filesize = Math.round(file?.size / 1000);
      if (this.filesize > 500) {
        this.fileTooBig();
        return;
      }

      this.selectedImg.emit(file);

      this.setFile(file, element);
    } else {
      element.value = '';
      this.imageSelected = false;
    }
  }

  /**
   * Handles avatar selection by the user.
   * @param {string} avatarUrl - The URL of the selected avatar.
   * @memberof PhotoSelectionComponent
   */
  onSelectedAvatar(avatarUrl: string): void {
    this.selectedImg.emit(avatarUrl);

    this.imgSrcUrl = avatarUrl;
    this.imageSelected = true;
  }

  /**
   * Handles the case when the uploaded file is too large.
   * @memberof PhotoSelectionComponent
   */
  fileTooBig() {
    this.imageSelected = false;
    this.uploadErr = true;
    this.imgSrcUrl = this.DEFAULT_IMG_SRC_URL;
  }

  /**
   * Sets the uploaded file and reads its data.
   * @param {File} file - The uploaded file.
   * @param {HTMLInputElement} element - The input element.
   * @memberof PhotoSelectionComponent
   */
  setFile(file: File, element: HTMLInputElement) {
    this.uploadedFile = file;
    const reader = new FileReader;
    reader.onload = () => {
      this.imgSrcUrl = reader.result;
      this.imageSelected = true;
      element.value = '';
    }
    reader.onerror = () => {
      console.error('Error occurred reading file');
    }
    reader.readAsDataURL(file);
  }

}
