import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-re-authenticate-user',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './re-authenticate-user.component.html',
  styleUrl: './re-authenticate-user.component.scss'
})
export class ReAuthenticateUserComponent {

  reAuthForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ReAuthenticateUserComponent>
  ) {
    this.reAuthForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  reAuthenticateUser() {
    if (this.reAuthForm.valid) {
      this.dialogRef.close(this.reAuthForm.value);
    }
  }
}
