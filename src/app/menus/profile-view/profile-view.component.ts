import { Component, EventEmitter, Output } from '@angular/core';
import { User } from '../../models/user.class';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { HeaderProfileService } from '../../services/header-profile.service';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.scss'
})
export class ProfileViewComponent {
  @Output() editClicked = new EventEmitter<void>();

  user?: User;

  private userSub = new Subscription();

  constructor(private auth: AuthService, private profileService: HeaderProfileService) {
    this.getUser();
  }

  /**
   * Subscribes to user data and assigns it to the user property.
   */
  getUser() {
    this.userSub = this.auth.getUser().subscribe(user => {
      if (user) {
        this.user = user;
      }
    });
  }

  /**
   * Closes the profile view and switches to the menu view.
   * @param event - The event triggering the close action.
   */
  closeView(event: Event) {
    event.stopPropagation();
    this.profileService.switchToMenu();
  }

  /**
   * Switches to the edit user mode.
   * @param event - The event triggering the edit action.
   */
  editUser(event: Event) {
    event.stopPropagation();
    this.profileService.switchToEdit();
  }

  /**
   * Unsubscribes from user data updates when the component is destroyed.
   */
  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
