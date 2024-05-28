import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
import { UserChat } from '../../models/user-chat';


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
    MatDialogModule
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

  opened: boolean = true;
  showChannels: boolean = true;
  showDirectMessages: boolean = true;
  online: boolean = true;
  users: any;
  channels: any;
  userId: string = '';
  selectedUser: User[] = [];
  allChannels: Partial<Channel>[] = [];
  channelTitles: { channelId: string, title: string }[] = [];
  directMessageTitle: { imageUrl: string, onlineStatus: string, name: string, id: string, chatId: string }[] = [];


  private userSub = new Subscription();
  private channelSub = new Subscription();


  constructor(private dataService: DataService, private authService: AuthService, public dialog: MatDialog) {
    this.dataSubscriptions();
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
   * Get and set direct messages to display in the sidenav.
   */
  getUserDirectMessages(): void {
    this.directMessageTitle = [];
    if (this.selectedUser && this.selectedUser.length > 0) {
      this.selectedUser.forEach((selected: User) => {
        if (selected.userChats && Array.isArray(selected.userChats)) {
          selected.userChats.forEach(chat => {
            const chatId = chat.userChatId;
            const matchedUser = this.users.find((user: User) => user.id === chatId);
            if (matchedUser) {
              let displayName = matchedUser.name;
              if (matchedUser.id === this.selectedUser[0].id) {
                displayName += " (Du)";
              }
              if (!this.directMessageTitle.some(dm => dm.id === matchedUser.id)) {
                this.directMessageTitle.push({
                  id: matchedUser.id,
                  imageUrl: matchedUser.imageUrl,
                  name: displayName,
                  onlineStatus: matchedUser.onlineStatus,
                  chatId: chat.chatId
                });
              }
            }
          });
        }
      });
    } else {
      console.log('Keine ausgewählten Benutzer vorhanden.');
    }
    this.sortDirectMessageUsers();
  }


  // getUserDirectMessages(): void {
  //   this.directMessageTitle = [];
  //   this.authService.getUserAuthId().then(myUserId => {
  //     if (myUserId) {
  //       this.dataService.getUserChatsList().subscribe((data: any) => {  // Use 'any' or 'unknown' and assert type inside
  //         const userChats = data as UserChat[];  // Assert that 'data' is of type UserChat[]
  //         userChats.forEach(chat => {
  //           chat.participants.forEach((participant: User) => {
  //             if (participant.id !== myUserId) {
  //               const matchedUser = this.users.find((user: { id: string; }) => user.id === participant.id);
  //               if (matchedUser) {
  //                 let displayName = matchedUser.name;
  //                 if (matchedUser.id === myUserId) {
  //                   displayName += " (Du)";
  //                 }
  //                 if (!this.directMessageTitle.some(dm => dm.id === matchedUser.id)) {
  //                   this.directMessageTitle.push({
  //                     id: matchedUser.id,
  //                     imageUrl: matchedUser.imageUrl,
  //                     name: displayName,
  //                     onlineStatus: matchedUser.onlineStatus
  //                   });
  //                 }
  //               }
  //             }
  //           });
  //         });
  //         this.sortDirectMessageUsers();
  //       }, error => console.error('Error fetching user chats', error));
  //     } else {
  //       console.log('Benutzer-ID nicht gefunden.');
  //     }
  //   });
  // }
  
  // getUserDirectMessages(): void {
  //   this.directMessageTitle = [];
  //   const myUserId = this.selectedUser && this.selectedUser.length > 0 ? this.selectedUser[0].id : null;
  
  //   console.log('USER ID', myUserId);
  
  //   if (myUserId) {
  //     this.dataService.getUserChatsList().subscribe({
  //       next: (data: any) => {
  //         const userChats = data as UserChat[];  // Assert that 'data' is of type UserChat[]
  //         userChats.forEach(chat => {
  //           chat.participants.forEach((participant: string) => { // Participant ist nun direkt eine ID
  //             if (participant !== myUserId) { // Überprüfen, ob die ID nicht die eigene ist
  //               const matchedUser = this.users.find((user: { id: string; }) => user.id === participant);
  //               if (matchedUser) {
  //                 let displayName = matchedUser.name;
  //                 if (matchedUser.id === myUserId) {
  //                   displayName += " (Du)";
  //                 }
  //                 if (!this.directMessageTitle.some(dm => dm.id === matchedUser.id)) {
  //                   this.directMessageTitle.push({
  //                     id: matchedUser.id,
  //                     imageUrl: matchedUser.imageUrl,
  //                     name: displayName,
  //                     onlineStatus: matchedUser.onlineStatus
  //                   });
  //                 }
  //               }
  //             }
  //           });
  //         });
  //         this.sortDirectMessageUsers();
  //       },
  //       error: (error) => console.error('Error fetching user chats', error),
  //       complete: () => console.log('Finished processing user chats.')
  //     });
  //   } else {
  //     console.log('Keine Benutzer-ID gefunden.');
  //   }
  // }
  
  
  
  


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


  /**
   * Toggle variable for sidenav to open or close.
   */
  toggleSidenav(value: string) {
    if (value === 'sidenav') {
      this.opened = !this.opened;
    }
    if (value === 'channels') {
      this.showChannels = !this.showChannels;
    }
    if (value === 'private') {
      this.showDirectMessages = !this.showDirectMessages;
    }
  }


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