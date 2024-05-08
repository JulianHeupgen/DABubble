import { AuthService } from './../services/auth.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {

  constructor( private authService: AuthService ) {}

  newEmail: string = '';
  email: string | null = '';

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.setEmail();
  }

  async setEmail() {
    try {
      this.email = await this.authService.getUserEmail();
    } catch (error) {
      console.error('Failed to get email. ', error);
    }
  }

  async changeEmail() {
    if (!this.newEmail) { return }
    try {
      await this.authService.updateEmailAddress(this.newEmail);
      console.log('Email successfull changed to: ', this.newEmail);
    } catch (error) {
      console.error('Error while updating the email adress to auth and db.');
    }
  }
}
