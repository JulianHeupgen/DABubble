import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.class';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss'
})
export class ProfileEditComponent {

  emailEditForm: FormGroup;
  nameEditForm: FormGroup;

  user!: User;

  constructor(private auth: AuthService, private router: Router, private formBuilder: FormBuilder) {
    this.emailEditForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.nameEditForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+ [a-zA-Z]+$')]]
    });
  }

  private userSub = new Subscription();

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.userSub = this.auth.getUser().subscribe(user => {
      if (user) {
        this.user = user;
        this.updateFormValues()
      }
    })
  }

  updateEmail() {
    console.log('email form submitted');
  }

  updateName() {

  }

  updateFormValues() {
    this.emailEditForm.patchValue({
      email: this.user.email
    });
    this.nameEditForm.patchValue({
      name: this.user.name
    });
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

}
