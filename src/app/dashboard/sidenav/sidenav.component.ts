import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule, MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { DataService } from '../../services/data.service';
import { User } from '../../models/user.class';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Channel } from '../../models/channel.class';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddChannelComponent } from '../../dialog/add-channel/add-channel.component';
import { SearchComponent } from '../search/search.component';
import { SidenavService } from '../../services/sidenav.service';


@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    MatSidenavModule,
    CommonModule,
    MatButtonModule,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    RouterModule,
    MatDialogModule,
    SearchComponent
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0,
        transform: 'translateX(-100%)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'translateX(0)'
      })),
      transition(':enter', [animate('300ms ease-in')]),
      transition(':leave', [animate('300ms ease-out')])
    ])
  ]
})


export class SidenavComponent {

  online: boolean = true;
  users: any;
  channels: any;
  userId: string = '';
  selectedUser: User[] = [];
  allChannels: Partial<Channel>[] = [];
  channelTitles: { channelId: string, title: string }[] = [];
  directMessageTitle: { imageUrl: string, onlineStatus: string, name: string, id: string }[] = [];


  private userSub = new Subscription();
  private channelSub = new Subscription();


  constructor(private dataService: DataService, private authService: AuthService, public dialog: MatDialog, public sidenavService: SidenavService) {
    this.dataSubscriptions();
  }


  /**
  * Handles the window resize event to dynamically adjust UI components.
  * This method is triggered whenever the window is resized. It updates the
  * `windowWidth` property of the `sidenavService` with the current window width
  * and calls `updateScreenSize` to adjust UI components based on the new window size.
  * This ensures that the application's UI responsiveness is maintained across different
  * screen sizes.
  */
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.sidenavService.windowWidth = window.innerWidth;
    this.sidenavService.updateScreenSize();
  }


  /**
  * Subscribes to user and channel data streams from the DataService.
  * This method initializes and manages data subscriptions that populate the component's
  * user and channel data. Upon receiving new users, it updates direct messages and channel
  * information. It also attempts to fetch and set user-specific data based on an authenticated
  * user ID from the AuthService. Errors in fetching the user ID are logged.
  * Additionally, this method subscribes to the channel list updates, ensuring the component
  * remains updated with the latest channel data.
  */
  dataSubscriptions() {
    this.userSub = this.dataService.getUsersList().subscribe(users => {
      this.users = users;
      this.updateDirectMessages();
      this.refreshChannels();
      this.authService.getUserAuthId().then(uid => {
        if (uid) {
          this.setUserData(uid);
        } else {
          console.log('Keine UID verfügbar');
        }
      }).catch(error => {
        console.error('Fehler beim Laden der UID:', error);
      });
    });
    this.channelSub = this.dataService.getChannelsList().subscribe(channels => {
      this.channels = channels;
      this.refreshChannels();
      this.checkDataForChannelNames();
    });
  }


  /**
  * Updates the display of direct messages based on the currently selected user.
  * This method checks if there is at least one selected user and, if so, triggers
  * a method to retrieve and update direct messages for that user. It ensures that
  * the direct messages section is refreshed appropriately when user selection changes
  * or relevant user data is updated.
  */
  updateDirectMessages() {
    if (this.selectedUser && this.selectedUser.length > 0) {
      this.getUserDirectMessages();
    }
  }


  /**
  * Checks if user and channel data are both available and updates UI components accordingly.
  * This method verifies the presence of both user and channel data loaded into the component.
  * If both data sets are present, it triggers updates to channel titles and refreshes the display
  * of direct messages. This ensures that the UI components related to channels and messages
  * reflect the current and complete data.
  */
  checkDataForChannelNames() {
    if (this.users && this.channels) {
      this.updateChannelTitles();
      this.getUserDirectMessages();
    }
  }


  /**
  * Sets the data for a specified user based on the provided authentication ID.
  * This method searches the loaded user data for a user with a matching authentication ID.
  * If the user is found, they are set as the currently selected user. If the user data
  * is not yet loaded or no matching user is found, appropriate error messages are logged.
  *
  * @param {string} uid - The authentication ID used to identify the user.
  */
  setUserData(uid: string) {
    if (!this.users) {
      console.error('Benutzerdaten sind noch nicht geladen.');
      return;
    }
    const user = this.users.find((user: User) => user.authUserId === uid);
    if (user) {
      this.selectedUser = [];
      this.selectedUser.push(user);
    } else {
      console.log('Kein User gefunden');
    }
  }


  /**
  * Refreshes the list of channels by fetching the latest data from the DataService.
  * This method subscribes to the channel data from the DataService, updating the local
  * channel list with the new data as it becomes available. Following the data update,
  * it triggers methods to update channel titles and verify the consistency of channel
  * names with user data, ensuring that the UI reflects the most current information.
  */
  refreshChannels() {
    this.dataService.getChannelsList().subscribe(channels => {
      this.channels = channels;
      this.updateChannelTitles();
      this.checkDataForChannelNames();
    });
  }


  /**
  * Updates the list of channel titles for display based on the channels associated with the selected user.
  * This method iterates over each selected user and their associated channel IDs, searching for matching
  * channels in the local channel data. If a match is found, the channel's details are added to the
  * channelTitles array for display purposes. This ensures that the displayed channel titles are accurate
  * and up-to-date with the user's channel subscriptions.
  */
  updateChannelTitles() {
    this.channelTitles = [];
    this.selectedUser.forEach(user => {
      if (user.channels && Array.isArray(user.channels)) {
        user.channels.forEach(userChannelId => {
          const matchedChannel = this.channels.find((channel: Channel) => channel.channelId === userChannelId);
          if (matchedChannel) { // && matchedChannel.channelId && matchedChannel.title) {
            this.channelTitles.push({
              channelId: matchedChannel.channelId,
              title: matchedChannel.title
            });
          }
        });
      }
    });
  }


  /**
  * Retrieves and processes direct messages for the selected users.
  * This method clears the existing list of direct message titles and checks if there are any selected users.
  * If no users are selected, it logs a message and exits. For each selected user, it processes their direct
  * messages by extracting relevant data and then sorts the direct message list to ensure proper display order.
  * This method is crucial for maintaining an up-to-date and orderly display of direct messages in the UI.
  */
  getUserDirectMessages(): void {
    this.directMessageTitle = [];
    if (!this.selectedUser || this.selectedUser.length === 0) {
      console.log('Keine ausgewählten Benutzer vorhanden.');
      return;
    }
    this.selectedUser.forEach(user => this.processUser(user));
    this.sortDirectMessageUsers();
  }


  /**
  * Processes the chat information of a selected user to extract and prepare direct message details.
  * This method iterates through each chat associated with the selected user. For each chat, it finds the
  * corresponding chat partner using their ID. If the chat partner is found and not already listed in the direct
  * messages, their details are added to the direct message list with a display name formatted for the UI.
  * This method ensures that the direct messages are accurately represented with up-to-date information.
  *
  * @param {User} selected - The user object containing chat information to be processed.
  */
  private processUser(selected: User): void {
    if (!selected.userChats || !Array.isArray(selected.userChats)) return;
    selected.userChats.forEach(chat => {
      const matchedUser = this.findUserById(chat.userChatId);
      if (!matchedUser) return;
      const displayName = this.buildDisplayName(matchedUser);
      if (this.isUniqueDirectMessage(matchedUser.id)) {
        this.addDirectMessage(matchedUser, displayName);
      }
    });
  }


  /**
  * Finds and returns a user object based on the provided user ID.
  * This method searches through the list of users to find a user with a matching ID.
  * If a match is found, the corresponding user object is returned. If no match is found,
  * the method returns undefined.
  *
  * @param {string} userId - The ID of the user to be found.
  * @returns {User | undefined} - The user object if found, otherwise undefined.
  */
  private findUserById(userId: string): User | undefined {
    return this.users.find((user: User) => user.id === userId);
  }


  /**
  * Builds and returns a display name for the provided user.
  * This method takes a user object and constructs a display name.
  * If the user's ID matches the ID of the first selected user, it appends "(Du)" to the name
  * to indicate that the user is the current user. This helps in distinguishing the current user
  * in the UI.
  *
  * @param {User} user - The user object for which to build the display name.
  * @returns {string} - The constructed display name for the user.
  */
  private buildDisplayName(user: User): string {
    let displayName = user.name;
    if (user.id === this.selectedUser[0].id) {
      displayName += " (Du)";
    }
    return displayName;
  }


  /**
  * Checks if a user is already included in the direct message list.
  * This method determines if a user with the given user ID is unique
  * in the context of the current direct message titles. It returns true
  * if the user ID is not found in the direct message list, indicating
  * that the user is unique and should be added. Otherwise, it returns false.
  *
  * @param {string} userId - The ID of the user to check for uniqueness.
  * @returns {boolean} - True if the user is unique (not in the direct message list), otherwise false.
  */
  private isUniqueDirectMessage(userId: string): boolean {
    return !this.directMessageTitle.some(dm => dm.id === userId);
  }


  /**
   * Adds processed direct message data to the `directMessageTitle` array for rendering.
   * 
   * @param user - The user object containing details for the direct message.
   * @param displayName - The user's formatted display name.
   * @param chatId - The ID of the chat associated with the direct message.
   */
  private addDirectMessage(user: User, displayName: string): void {
    this.directMessageTitle.push({
      id: user.id,
      imageUrl: user.imageUrl,
      name: displayName,
      onlineStatus: user.onlineStatus
    });
  }


  /**
  * Adds a user's direct message details to the direct message list.
  * This method takes a user object and a display name, and pushes an object
  * containing the user's direct message information (ID, image URL, name, and online status)
  * onto the `directMessageTitle` array. This helps in maintaining a list of direct messages
  * for display in the UI.
  *
  * @param {User} user - The user object containing the direct message details.
  * @param {string} displayName - The display name to be used for the user.
  */
  sortDirectMessageUsers() {
    this.directMessageTitle.sort((a, b) => {
      if (a.id === this.selectedUser[0].id) return -1;
      if (b.id === this.selectedUser[0].id) return 1;
      return 0;
    });
  }


  /**
  * Opens a dialog to add a new channel.
  * This method uses the Angular Material Dialog service to open a dialog
  * component, specifically the `AddChannelComponent`. This allows users to
  * interact with a form or interface for adding a new channel to the application.
  */
  openDialog() {
    this.dialog.open(AddChannelComponent);
  }


  /**
  * Truncates the given title if it exceeds the specified character limit.
  * This method checks the length of the provided title and, if it exceeds
  * the specified limit, truncates it to the limit and appends an ellipsis ('...').
  * If the title is within the limit, it is returned unchanged.
  *
  * @param {string} title - The title to be truncated.
  * @param {number} limit - The maximum number of characters allowed for the title.
  * @returns {string} - The truncated title if it exceeds the limit, otherwise the original title.
  */
  truncateTitleName(title: string, limit: number): string {
    return title.length > limit ? title.substring(0, limit) + '...' : title;
  }


  /**
  * Cleans up subscriptions to prevent memory leaks.
  * This method is called when the component is destroyed. It unsubscribes
  * from the `userSub` and `channelSub` subscriptions to ensure that there are
  * no active subscriptions left, which helps in preventing memory leaks and
  * potential performance issues.
  */
  ngOnDestroy() {
  this.userSub?.unsubscribe();
  this.channelSub?.unsubscribe();
  }
}