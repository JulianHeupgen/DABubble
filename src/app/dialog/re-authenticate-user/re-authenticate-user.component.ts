import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-re-authenticate-user',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIconModule, MatCardModule, MatButtonModule],
  templateUrl: './re-authenticate-user.component.html',
  styleUrl: './re-authenticate-user.component.scss'
})
export class ReAuthenticateUserComponent {

  reAuthForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ReAuthenticateUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.reAuthForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Closes the dialog and returns the form value if the form is valid.
   */
  reAuthenticateUser() {
    if (this.reAuthForm.valid) {
      this.dialogRef.close(this.reAuthForm.value);
    }
  }
}
