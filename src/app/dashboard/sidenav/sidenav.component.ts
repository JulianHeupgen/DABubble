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
    RouterModule
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
  imageSrc: string = './assets/img/sidemenu_close_normal.png';
  editSrc: string = './assets/img/edit_square.png';
  arrowSrc: string = './assets/img/arrow_drop_down.png';
  arrowSrcWs: string = './assets/img/arrow_drop_down.png';
  logoSrc: string = './assets/img/private_message_logo.png';
  logoSrcWs: string = './assets/img/workspaces.png';
  add: string = './assets/img/add_channel.png';
  addCircle: string = './assets/img/add_circle.png';
  online: boolean = true;
  users: any;
  channels: any;
  userId: string = '';
  // selectedUser: Partial<User>[] = [];
  selectedUser: User[] = [];
  allChannels: Partial<Channel>[] = [];
  channelTitles: { channelId: string, title: string }[] = [];
  directMessageTitle: { imageUrl: string, onlineStatus: string, name: string, id: string }[] = [];

  private userSub: Subscription = new Subscription();
  private channelSub: Subscription = new Subscription();


  constructor(private dataService: DataService, private authService: AuthService) {
    this.users = [];
  }


  async ngOnInit() {
    this.dataSubscriptions();
  }


  /**
   * Subscribe users and channels from DataService
   */
  dataSubscriptions() {
    this.userSub = this.dataService.getUsersList().subscribe(users => {
      this.users = users;
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
      this.checkDataForChannelNames();
    });
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
   * Read out the user data based on the user authentication id
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
      console.log('User gefunden', user);
      this.selectedUser = [];
      this.selectedUser.push(user);
    } else {
      console.log('Kein User gefunden', uid);
    }
  }

  // setUserData(uid: string) {
  //   if (!this.users || this.users.length === 0) {
  //     console.error('Benutzerdaten sind noch nicht geladen oder die Liste ist leer.');
  //     return;
  //   }
  //   const user = this.users.find((user: User) => user.authUserId === uid);
  //   if (user) {
  //     console.log('User gefunden', user);
  //     this.selectedUser = [user];  // Direktes Setzen als Array mit einem Eintrag
  //   } else {
  //     console.log('Kein User gefunden für UID:', uid);
  //   }
  // }


  /**
   * Set and Update the channel titles for the sidenav rendering
   */
  updateChannelTitles() {
    this.channelTitles = [];
    this.selectedUser.forEach(user => {
      if (user.channels && Array.isArray(user.channels)) {
        user.channels.forEach(userChannelId => {
          const matchedChannel = this.channels.find((channel: Channel) => channel.channelId === userChannelId);
          if (matchedChannel && matchedChannel.channelId && matchedChannel.title) {
            this.channelTitles.push({
              channelId: matchedChannel.channelId,
              title: matchedChannel.title
            });
          }
        });
      }
    });
    console.log("TESTTEST", this.users.userChats);
    
  }

  // getUserDirectMessages(): void {
  //   this.directMessageTitle = [];  // Initialisiert das Ergebnis-Array
  //   this.selectedUser.forEach((selected: User) => {
  //     if (selected.userChats && Array.isArray(selected.userChats)) {
  //       selected.userChats.forEach(chatId => {  // chatId ist bereits die ID
  //         const matchedUser = this.users.find((user: User) => user.id === chatId);
  //         if (matchedUser) {
  //           // Fügt den gefundenen Benutzer zum Ergebnis-Array hinzu, falls nicht bereits vorhanden
  //           if (!this.directMessageTitle.some(dm => dm.id === matchedUser.id)) {
  //             this.directMessageTitle.push({
  //               id: matchedUser.id,
  //               imageUrl: matchedUser.imageUrl,
  //               name: matchedUser.name,
  //               onlineStatus: matchedUser.onlineStatus
  //             });
  //           }
  //         }
  //       });
  //     }
  //   });
  //   console.log('Direct Message Titles:', this.directMessageTitle);
  // }

  getUserDirectMessages(): void {
    this.directMessageTitle = [];  // Initialisiert das Ergebnis-Array
    this.selectedUser.forEach((selected: User) => {

      // Verwende `userChatId` statt `userChats`
      if (selected.userChatId && Array.isArray(selected.userChatId)) {
        selected.userChatId.forEach(chatId => {  // chatId ist bereits die ID
          const matchedUser = this.users.find((user: User) => user.id === chatId);
          if (matchedUser) {
            // Fügt den gefundenen Benutzer zum Ergebnis-Array hinzu, falls nicht bereits vorhanden
            if (!this.directMessageTitle.some(dm => dm.id === matchedUser.id)) {
              this.directMessageTitle.push({
                id: matchedUser.id,
                imageUrl: matchedUser.imageUrl,
                name: matchedUser.name,
                onlineStatus: matchedUser.onlineUserStatus
              });
            }
          }
        });
      }
    });
    console.log('Direct Message Titles:', this.directMessageTitle);
  }
  


  // getUserDirectMessages() {
  //   this.directMessageTitle = [];
  //   this.selectedUser.forEach(user => {
  //     if (user.userChats && Array.isArray(user.userChats)) {
  //       user.userChats.forEach(userChats => {
  //         const matchedUsers = this.users.find(userChat => userChat.id === userChats);
  //         console.log('CHATS', userChats);
  //         console.log('USERS', this.users);
          
          
  //       })
  //     }
  //   })
  // }


  /**
   * Toggle variable for sidenav to open or close
   */
  toggleSidenav() {
    this.opened = !this.opened;
  }


  hoverMenuButton() {
    if (this.opened) {
      this.imageSrc = './assets/img/sidemenu_close_hover.png';
    } else {
      this.imageSrc = './assets/img/sidemenu_open_hover.png';
    }
  }


  resetHover() {
    if (!this.opened) {
      this.imageSrc = './assets/img/sidemenu_open_normal.png';
    } else {
      this.imageSrc = './assets/img/sidemenu_close_normal.png';
    }
  }


  hoverEdit(originalSrc: 'editSrc' | 'arrowSrc' | 'logoSrc' | 'logoSrcWs' | 'arrowSrcWs' | 'add' | 'addCircle', url: string) {
    this[originalSrc] = url;
  }


  resetHoverEdit(originalSrc: 'editSrc' | 'arrowSrc' | 'logoSrc' | 'logoSrcWs' | 'arrowSrcWs' | 'add' | 'addCircle', url: string) {
    this[originalSrc] = url;
  }


  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.channelSub) {
      this.channelSub.unsubscribe();
    }
  }
}
