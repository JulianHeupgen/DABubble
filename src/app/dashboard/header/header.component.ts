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

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  constructor(private auth: AuthService, private router: Router) {}

  user?: User;
  online = true;

  private userSub = new Subscription();

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.userSub = this.auth.getUser().subscribe(user => {
      if (user) {
        this.user = user;
      }
    })
  }

  openProfile() {

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
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
