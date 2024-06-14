import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.class';
import { Subscription } from 'rxjs';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProfileEditComponent } from '../../menus/profile-edit/profile-edit.component';
import { ProfileViewComponent } from '../../menus/profile-view/profile-view.component';
import { HeaderProfileService } from '../../services/header-profile.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SearchComponent } from '../search/search.component';
import { SidenavService } from '../../services/sidenav.service';

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
    ProfileViewComponent,
    MatMenuTrigger,
    SearchComponent
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
        animate('400ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0ms', style({ opacity: 0 }))
      ]),
    ])
  ]
})

export class HeaderComponent {

  user?: User;
  isProfileView?: boolean = false;
  isProfileEditView?: boolean = false;

  private userSub = new Subscription();
  private profileViewSub = new Subscription();
  private profileEditSub = new Subscription();

  /**
   * Init AuthService, Router and ProfileService and starting subscribtion for Profile Views and User Data
   * @param auth
   * @param router
   * @param profileService
   */
  constructor(
    private auth: AuthService,
    private router: Router,
    private profileService: HeaderProfileService,
    public sidenavService: SidenavService
  ) {
    this.subProfileView();
    this.subProfileEdit();
    this.subUserData();
  }

  /**
   * This function resets the profile menu panel state when it gets reopened
   * Gets fired by the (menuOpened) trigger
   */
  resetMenuState(): void {
    this.profileService.switchToMenu();
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

  /**
   * Switch Profile Menu to Edit Profile View
   */
  switchToEdit() {
    this.profileService.switchToEdit();
  }

  /**
   * Closes Profile Menu and switches to default menu
   */
  closeProfile(event: Event) {
    event.stopPropagation();
    this.profileService.switchToMenu();
  }

  /**
   * Open Profile View
   */
  openProfile(event: Event) {
    event.stopPropagation();
    this.profileService.switchToView();
  }

  /**
   * Logout User
   */
  async logoutUser() {
    try {
      await this.auth.updateFirebaseUser({ onlineStatus: 'offline' });
      const tryLogout = await this.auth.logout();
      if (tryLogout === true) {
        this.router.navigate(['/login']);
      }
      console.log('User logged out.');
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Destroy all Active Subscriptions
   */
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
