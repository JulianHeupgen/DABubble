import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.class';
import { Subscription } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileEditComponent } from '../../menus/profile-edit/profile-edit.component';
import { ProfileViewComponent } from '../../menus/profile-view/profile-view.component';
import { HeaderProfileService } from '../../services/header-profile.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    MatMenuModule,
    CommonModule,
    ProfileEditComponent,
    ProfileViewComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0
      })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0ms', style({ opacity: 0 }))
      ]),
    ])
  ]
})

export class HeaderComponent {

  user?: User;
  isProfileView?: boolean;
  isProfileEditView?: boolean;

  private userSub = new Subscription();
  private profileViewSub = new Subscription();
  private profileEditSub = new Subscription();

  constructor(
    private auth: AuthService,
    private router: Router,
    private profileService: HeaderProfileService
  ) {
    this.subProfileView();
    this.subProfileEdit();
    this.subUserData();
  }

  /**
   * Subscribe to profile view observable
   */
  subProfileView() {
    this.profileViewSub = this.profileService.profileViewState$.subscribe(state => {
      this.isProfileView = state;
    });
  }

  /**
   * Subscribe to profile edit observable
   */
  subProfileEdit() {
    this.profileEditSub = this.profileService.profileEditState$.subscribe(state => {
      this.isProfileEditView = state;
    });
  }

  /**
   * Subscribe to user data
   */
  subUserData() {
    this.userSub = this.auth.getUser().subscribe(user => {
      if (user) {
        this.user = user;
      }
    })
  }

  switchToEdit() {
    this.profileService.switchToEdit();
  }

  closeProfile(event: Event) {
    event.stopPropagation();
    this.profileService.switchToMenu();
  }

  openProfile(event: Event) {
    event.stopPropagation();
    this.profileService.switchToView();
  }

  async logoutUser() {
    try {
      await this.auth.updateUserOnlineStatus('offline');
      const tryLogout = await this.auth.logout();
      if (tryLogout === true) {
        this.router.navigate(['/login']);
      }
      console.log('User logged out.');
    } catch (error) {
      console.error(error);
    }
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.profileViewSub) {
      this.profileViewSub.unsubscribe();
    }
    if (this.profileEditSub) {
      this.profileEditSub.unsubscribe();
    }
  }
}
