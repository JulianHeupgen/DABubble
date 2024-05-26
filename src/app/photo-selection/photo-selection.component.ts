import {Component, EventEmitter, Inject, Input, Optional, Output} from '@angular/core';
import { UserRegistrationService } from '../services/user-registration.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {RouterModule} from "@angular/router";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {defaultAvatars} from "../configuration/default-avatars";

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

  @Input({required: true}) showBackArrow: boolean = false;
  @Input({required: true}) showClose: boolean = false;

  @Input({required: true}) onNext?: () => void;

  @Input() buttonText: string = 'Weiter';

  @Output() selectedImg = new EventEmitter<File | string>();

  fullName: string = 'Full Name';
  defaultAvatars = defaultAvatars;

  // URL which is shown on the Card as selected image
  DEFAULT_IMG_SRC_URL: string = './../../assets/img/profile-empty.png';
  imgSrcUrl: string | ArrayBuffer | null = this.DEFAULT_IMG_SRC_URL;

  // Needed boolean to deactivate the next button
  imageSelected: boolean = false;

  // Image uploaded by the User Input field
  uploadedFile: File | null = null;

  filesize: number = 0;
  uploadErr: boolean = false;

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

  ngOnInit(): void {
    this.fullName = this.userRegService.getUserFullName();
    if (this.data) {
      this.showClose = this.data.showClose;
      this.showBackArrow = this.data.showBackArrow;
      this.buttonText = this.data.buttonText;
      this.onNext = this.data.onNext;
    }
  }

  // Method to call the Next function from the onNext @Input
  handleNext() {
    if (this.onNext) {
      this.onNext();
    }
  }

  closeDialog(event: Event) {
    event.stopPropagation();
    this.dialogRef.close();
  }

  // runs when the user uploads a photo
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

      // Emit the file and log it
      this.selectedImg.emit(file);

      this.setFile(file, element);
    } else {
      element.value = '';
      this.imageSelected = false;
    }
  }

  // runs when the user select a preset picture
  onSelectedAvatar(avatarUrl: string): void {

    this.selectedImg.emit(avatarUrl);

    this.imgSrcUrl = avatarUrl;
    this.imageSelected = true;
  }

  fileTooBig() {
    this.imageSelected = false;
    this.uploadErr = true;
    this.imgSrcUrl = this.DEFAULT_IMG_SRC_URL;
  }

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
