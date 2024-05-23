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
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

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

  @Input({required: true}) showBackArrow: boolean = true;
  @Input({required: true}) onNext?: () => void;
  @Output() selectedImg = new EventEmitter<File | string>();

  fullName: string = 'Full Name';
  defaultAvatars: string[] = [
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-4a31a.appspot.com/o/avatar_1.png?alt=media&token=76a558f3-7364-4591-8b0d-9084a608438d',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-4a31a.appspot.com/o/avatar_2.png?alt=media&token=c11604f5-49f6-4faf-b7c7-5e1795c67e12',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-4a31a.appspot.com/o/avatar_3.png?alt=media&token=8e57bc9d-29fd-4e99-aece-435a6edf761a',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-4a31a.appspot.com/o/avatar_4.png?alt=media&token=d518661c-a6d0-4cbe-846a-8c7fcc072e98',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-4a31a.appspot.com/o/avatar_5.png?alt=media&token=27617a09-956f-47c4-b96a-bedd411f6da1',
    'https://firebasestorage.googleapis.com/v0/b/da-bubble-4a31a.appspot.com/o/avatar_6.png?alt=media&token=c4962f78-c6cf-4d28-964b-ed104548d2da'
  ];

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
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { showBackArrow: boolean, onNext?: () => void }
  ) { }

  ngOnInit(): void {
    this.fullName = this.userRegService.getUserFullName();
    if (this.data) {
      this.showBackArrow = this.data.showBackArrow;
      this.onNext = this.data.onNext;
    }
  }

  // Method to call the Next function from the onNext @Input
  handleNext() {
    if (this.onNext) {
      this.onNext();
    }
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
