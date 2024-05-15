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

  getUser() {
    this.userSub = this.auth.getUser().subscribe(user => {
      if (user) {
        this.user = user;
      }
    })
  }

  closeEdit(event: Event) {
    event.stopPropagation();
    this.profileService.switchToMenu();
  }

  editUser(event: Event) {
    event.stopPropagation();
    this.profileService.switchToEdit();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }


}
