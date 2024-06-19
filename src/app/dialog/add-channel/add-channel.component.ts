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
  showDuplicateError: boolean = false;
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
   * Attempts to create a new channel based on the provided channel name and description.
   * It validates the channel name, creates the channel data, and attempts to add it to the data service.
   * If successful, it proceeds with post-creation UI actions; otherwise, it logs a warning.
   */
  async createChannel() {
    if (!this.isValidChannelName(this.channelName)) {
      return;
    }
    const newChannelData = this.prepareNewChannelData(this.channelName, this.channelDescription);
    try {
      this.createdChannelId = await this.dataService.addChannel(newChannelData);
      this.postChannelCreation();
    } catch (error) {
      console.warn('Fehler beim Erstellen', error);
    }
  }


  /**
   * Validates the channel name by checking its length and uniqueness.
   * Shows error messages through UI flags if validations fail.
   * @param {string} channelName - The name of the channel to validate.
   * @returns {boolean} True if the channel name is valid, otherwise false.
   */
  isValidChannelName(channelName: string): boolean {
    if (channelName.length < 3) {
      this.showNameError = true;
      return false;
    }
    if (this.checkChannelNameExists(channelName)) {
      this.showDuplicateError = true;
      return false;
    }
    return true;
  }


  /**
   * Prepares the data for a new channel, including its title, description, initial participant list, and creator.
   * @param {string} title - The title of the channel.
   * @param {string} description - A description of the channel.
   * @returns {Channel} The new channel object ready to be added to the data service.
   */
  prepareNewChannelData(title: string, description: string): Channel {
    return new Channel({
      title,
      description,
      participants: [],
      createdBy: this.currentUser.id
    });
  }


  /**
   * Executes post-channel creation actions, which include resetting the form and opening a dialog
   * for channel members.
   */
  postChannelCreation() {
    this.resetForm();
    this.openChannelMembersDialog();
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
          data: {
            channelId: this.createdChannelId,
            createdBy: this.currentUser.id
          }
        });
      }, 500);
    }
  }


  /**
  * Checks if a channel with the given name already exists.
  * This method searches through all channels available in the `dataService`
  * to determine if there is a channel with a title that matches the provided
  * channel name. It returns true if a match is found, otherwise false.
  *
  * @param {string} channelName - The name of the channel to check for existence.
  * @returns {boolean} - True if a channel with the given name exists, otherwise false.
  */
  checkChannelNameExists(channelName: string): boolean {
    return this.dataService.allChannels.some(channel => channel.title === channelName);
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