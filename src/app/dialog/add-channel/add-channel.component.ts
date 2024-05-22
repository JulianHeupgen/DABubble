import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../services/data.service';
import { Channel } from '../../models/channel.class';
import { ChannelMembersComponent } from '../channel-members/channel-members.component';
import { User } from '../../models/user.class';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss'
})
export class AddChannelComponent {

  channelName: string = '';
  channelDescription: string = '';
  createdChannelId: string | null = null;
  showNameError: boolean = false;
  users: any;
  userAuthId!: string;
  currentUser!: User;
  private userSub: Subscription = new Subscription();

  constructor(public dialog: MatDialog, private dataService: DataService, private auth: AuthService) {
    this.userSub = this.dataService.getUsersList().subscribe((users: any) => {
      this.users = users;
    });
    this.checkUserAuthId();
  }


  /**
   * Checks the authentication ID of the user asynchronously and then performs an action. If a user ID is found, it is saved and used later to identify the current user. 
   * If no user is logged in, a corresponding message is displayed. If an error occurs, this is logged. After a short delay, a function is called to identify the current user.
   */
  async checkUserAuthId() {
    await this.auth.getUserAuthId().then(userId => {
      if (userId) {
        this.userAuthId = userId;
      } else {
        console.log("Kein Benutzer angemeldet.");
      }
    }).catch(error => {
      console.error("Fehler beim Abrufen der Benutzer-ID:", error);
    });
    setTimeout(() => {
      this.findCurrentUser(this.userAuthId);
    }, 600);
  }


  /**
   * Searches for and sets the current user based on a given authentication ID. 
   * This function searches the `users` array for a user object whose `authUserId` property matches the given `authId`. 
   * If a corresponding user is found, a new instance of this user is created and `this.currentUser` is set to it.
   * 
   * @param authId - The authentication ID used to identify the current user.
   */
  findCurrentUser(authId: string) {
    const user = this.users.find((user: User) => user.authUserId === authId);
    if (user) {
      this.currentUser = new User(user);
    }
  }


  /**
   * Creates a new channel asynchronously based on the data entered. 
   * First checks whether the channel name meets the minimum length of 3 characters. 
   * If the name is valid, a channel object is created and saved via a data service. 
   * Errors of the process are logged in the console. 
   * If successful, forms are also reset and a dialog for managing channel members is opened.
   * 
   * @returns - if operation is not successfully
   * @throws {Error} - Displays a warning in the console if the channel cannot be created.
   */
  async createChannel() {
    if (this.channelName.length < 3) {
      this.showNameError = true;
      return;
    }
    const newChannelData = new Channel({
      title: this.channelName,
      description: this.channelDescription,
      participants: [],
      createdBy: this.currentUser.id
      // threads: []
    });
    try {
      this.createdChannelId = await this.dataService.addChannel(newChannelData);
      this.resetForm();
      this.openChannelMembersDialog();
    } catch (error) {
      console.warn('Fehler beim Erstellen', error);
    }
  }


  /**
   * Resets the form fields for the channel name and the channel description and closes all open dialog boxes. 
   * This function is typically called after a channel has been created to prepare the form for future entries and to ensure that no dialog boxes remain open.
   */
  resetForm() {
    this.channelName = '';
    this.channelDescription = '';
    this.dialog.closeAll();
  }


  /**
   * Opens a dialog to display and manage the members of a created channel with a delay. 
   * The dialog is only opened if a valid channel ID is available, which indicates that the channel has been successfully created. 
   * The dialog shows information based on the transferred channel ID.
   */
  openChannelMembersDialog() {
    if (this.createdChannelId) {
      setTimeout(() => {
        this.dialog.open(ChannelMembersComponent, {
          data: { channelId: this.createdChannelId }
        });
      }, 500);
    }
  }


  /**
   * Called when an instance of the component or service is destroyed. 
   * This method takes care of cleaning up resources, in particular canceling subscriptions to avoid memory leaks.
   */
  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

}