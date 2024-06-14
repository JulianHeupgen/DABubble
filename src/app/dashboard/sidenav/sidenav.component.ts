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

  // opened: boolean = true;
  // showChannels: boolean = true;
  // showDirectMessages: boolean = true;
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


  constructor(public dataService: DataService, private authService: AuthService, public dialog: MatDialog, public sidenavService: SidenavService) {
    this.dataSubscriptions();
  }


  @HostListener('window:resize', ['$event'])
  onResize() {
   this.sidenavService.windowWidth = window.innerWidth;
   this.sidenavService.updateScreenSize();
  }


  /**
   * Subscribe users and channels from DataService
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
   * Main function to update user onlineStatus
   */
  updateDirectMessages() {
    if (this.selectedUser && this.selectedUser.length > 0) {
      this.getUserDirectMessages();
    }
  }


  /**
   * Checking the validity of the data of users and channels from the Observable 
   */
  checkDataForChannelNames() {
    if (this.users && this.channels) {
      this.updateChannelTitles();
      this.getUserDirectMessages();
    }
  }


  /**
   * Read out the user data based on the user authentication id.
   * 
   * @param uid - User authentication id from firestore authentication
   * @returns - Return if error exists
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
      console.log('Kein User gefunden', uid);
    }
  }


  /**
   * Pull refresh for channels on change.
   */
  refreshChannels() {
    this.dataService.getChannelsList().subscribe(channels => {
      this.channels = channels;
      this.updateChannelTitles();
      this.checkDataForChannelNames();
    });
  }


  /**
   * Set and Update the channel titles for the sidenav rendering.
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
   * Processes user chats to prepare direct messages for display in the HTML.
   * 
   * @returns - void
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
   * Processes individual user chats to extract relevant direct message information.
   * 
   * @param selected - The user object containing their chat data.
   * @returns - void
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
   * Finds a user object by their ID from the user list.
   * 
   * @param userId - The ID of the user to find.
   * @returns - The user object if found, otherwise undefined.
   */
  private findUserById(userId: string): User | undefined {
    return this.users.find((user: User) => user.id === userId);
  }

 
  /**
   * Builds a display name for a user, optionally adding "(Du)" for the selected user.
   * 
   * @param user - The user object for whom to build the display name.
   * @returns - The formatted display name.
   */
  private buildDisplayName(user: User): string {
    let displayName = user.name;
    if (user.id === this.selectedUser[0].id) {
      displayName += " (Du)";
    }
    return displayName;
  }


  /**
   * Checks if a user represents a unique direct message (not already added).
   * 
   * @param userId - The ID of the user to check.
   * @returns - True if the user is a unique direct message, false otherwise.
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
   * Fetching and sorting the user list for the sidenav. 
   * Main reason to display yourself at the top.
   */
  sortDirectMessageUsers() {
    this.directMessageTitle.sort((a, b) => {
      if (a.id === this.selectedUser[0].id) return -1;
      if (b.id === this.selectedUser[0].id) return 1;
      return 0;
    });
  }


  // /**
  //  * Toggle variable for sidenav to open or close.
  //  */
  // toggleSidenav(value: string) {
  //   if (value === 'sidenav') {
  //     this.dataService.opened = !this.dataService.opened;
  //   }
  //   if (value === 'channels') {
  //     this.dataService.showChannels = !this.dataService.showChannels;
  //   }
  //   if (value === 'private') {
  //     this.dataService.showDirectMessages = !this.dataService.showDirectMessages;
  //   }
  // }


  /**
   * Open AddChannelComponent per material dialog.
   */
  openDialog() {
    this.dialog.open(AddChannelComponent);
  }


  /**
   * Called when an instance of the component or service is destroyed. 
   * This method takes care of cleaning up resources, in particular canceling subscriptions to avoid memory leaks.
   */
  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.channelSub) {
      this.channelSub.unsubscribe();
    }
  }
}