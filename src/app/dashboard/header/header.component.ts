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
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  user!: User;
  isProfileOpen = false;
  isProfileEdit = false;

  constructor(private auth: AuthService, private router: Router) {}

  private userSub = new Subscription();

  ngOnInit(): void {
    this.userSub = this.auth.getUser().subscribe(user => {
      if (user) {
        this.user = user;
      }
    })
  }

  editProfile() {
    this.isProfileEdit = true;
  }

  openProfile(event: Event) {
    event.stopPropagation();
    this.isProfileOpen = true;
  }

  closeProfile(event: Event) {
    event.stopPropagation();
    this.isProfileOpen = false;
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
  }
}
