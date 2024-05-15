import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.class';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HeaderProfileService } from '../../services/header-profile.service';

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
    private profileService: HeaderProfileService
  ) {
    this.editUserForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+ [a-zA-Z]+$')]]
    });
    this.getUser();
  }

  private userSub = new Subscription();

  saveUser() {
    console.log('saving user');
  }

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
