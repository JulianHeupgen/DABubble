import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule, MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { DataService } from '../../services/data.service';
import { User } from '../../models/user.class';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { collection, DocumentData, Firestore, onSnapshot, query, where } from '@angular/fire/firestore';
import { Channel } from '../../models/channel.class';


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
  users: User[] = [];
  userId: string = '';
  allUsers: Partial<User>[] = [];
  allChannels: Partial<Channel>[] = [];
  // channelTitles = [];
  channelTitles: { channelId: string, title: string }[] = [];
  // userChannels: { [userId: string]: Channel[] } = {};
  private unsubscribe!: () => void;
  private unsubscribeChannels!: () => void;

  constructor(private dataService: DataService, private activatedRoute: ActivatedRoute, private authService: AuthService, private firestore: Firestore) {
    this.loadData();
  }


  async ngOnInit() {
    this.authService.getUserAuthId().then(uid => {
      if (uid) {
        this.setupUserSubscription(uid);
      } else {
        console.log('Keine UID verfügbar');
        this.allUsers = [];
      }
    }).catch(error => {
      console.error('Fehler beim Laden:', error);
      this.allUsers = [];
    });
    console.log('All users loaded:', this.allUsers);
    this.dataService.getChannelsList();
    this.allChannels = this.dataService.allChannels;
    console.log("Channels in users:", this.allUsers.map(user => user.channels));


  }


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


  getDataFromFirestore(): User[] {
    return this.dataService.allUsers;
  }


  // async loadData() {
  //   try {
  //     const uid = await this.authService.getUserAuthId();
  //     if (uid) {
  //       const users = await this.getDataFromFirestore();
  //       this.allUsers = users.filter(user => user.authUserId === uid);
  //     } else {
  //       console.log('Keine UID verfügbar');
  //       this.allUsers = [];
  //     }
  //   } catch (error) {
  //     console.error('Fehler beim laden der Daten', error);
  //     this.allUsers = [];
  //   }
  // }

  async loadData() {
    try {
      const uid = await this.authService.getUserAuthId();
      if (uid) {
        this.setupUserSubscription(uid);
        this.setupChannelsSubscription();
        setTimeout(() => this.updateChannelTitles(), 1000);
      } else {
        console.log('Keine UID verfügbar');
        this.allUsers = [];
        this.allChannels = [];
      }
    } catch (error) {
      console.error('Fehler beim laden:', error);
      this.allUsers = [];
      this.allChannels = [];
    }
  }

  setupUserSubscription(uid: string) {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('authUserId', '==', uid));
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      this.allUsers = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id
        };
      });
      console.log('Aktualisierte Benutzerdaten:', this.allUsers);
      console.log('TESTTEST', this.allUsers[0].channels);
      console.log('ALL CHANNELS', this.allChannels);
      
      
    }, (error) => {
      console.error('Fehler beim Abonnieren der Benutzerdaten:', error);
    });
  }

  // setupUserSubscription(uid: string) {
  //   const usersRef = collection(this.firestore, 'users');
  //   const q = query(usersRef, where('authUserId', '==', uid));
  //   this.unsubscribe = onSnapshot(q, (snapshot) => {
  //     this.allUsers = snapshot.docs.map(doc => ({
  //       id: doc.id,
  //       name: doc.data()['name'] || 'Unbekannter Name',
  //       email: doc.data()['email'] || 'Keine Email',
  //       onlineStatus: doc.data()['onlineStatus'] || 'offline',
  //       authUserId: doc.data()['authUserId'],
  //       imageUrl: doc.data()['imageUrl'] || 'Kein Bild',
  //       channels: doc.data()['channels'] || [],
  //       userChats: doc.data()['userChats'] || []
  //     }));
  //     console.log('Aktualisierte Benutzerdaten:', this.allUsers);
  //   }, (error) => {
  //     console.error('Fehler beim Abonnieren der Benutzerdaten:', error);
  //   });
  // }

  setupChannelsSubscription() {
    const channelsRef = collection(this.firestore, 'channels');
    this.unsubscribeChannels = onSnapshot(channelsRef, (snapshot) => {
      this.allChannels = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          channelId: doc.id,
          title: data['title'] || '',
          participants: data['participants'] || [],
          threads: data['threads'] || []
        };
      });
      console.log('Aktualisierte Kanaldaten:', this.allChannels);
    }, (error) => {
      console.error('Fehler beim Abonnieren der Kanaldaten:', error);
    });
}

// setupChannelsSubscription() {
//   const channelsRef = collection(this.firestore, 'channels');
//   this.unsubscribeChannels = onSnapshot(channelsRef, (snapshot) => {
//     this.allChannels = snapshot.docs.map(doc => {
//       const data = doc.data();
//       return {
//         docId: doc.id,  // Dokument-ID hinzufügen
//         data: {  // Daten des Dokuments
//           channelId: doc.id,
//           title: data['title'] || '',
//           participants: data['participants'] || [],
//           threads: data['threads'] || []
//         }
//       };
//     });
//     console.log('Aktualisierte Kanaldaten:', this.allChannels);
//   }, (error) => {
//     console.error('Fehler beim Abonnieren der Kanaldaten:', error);
//   });
// }

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubscribeChannels) this.unsubscribeChannels();
  }

  // getChannelNameById(channelId: string): string {
  //   const channel = this.allChannels.find(c => c.channelId === channelId);
  //   return channel ? channel.title : 'No Name';
  // }

  // getChannelTitleByDocId(docId: string): string | null {
  //   for (const user of this.allUsers) {
  //     if (user.channels?.some(channel => channel.channelId === docId)) {
  //       const channel = this.allChannels.find(channel => channel.docId === docId);
  //       // Typüberprüfung, um sicherzustellen, dass `data` das erwartete Objekt ist
  //       if (channel && typeof channel.data === 'object' && channel.data !== null && 'title' in channel.data) {
  //         return channel.data.title;
  //       }
  //       break;
  //     }
  //   }
  //   return null;
  // }

  // updateUserChannelTitles() {
  //   // Benutzerdaten anreichern mit den Kanaltiteln
  //   this.allUsers = this.allUsers.map(user => {
  //     const channelTitles = (user.channels || []).map(channelId => {
  //       const channel = this.allChannels.find(ch => ch.docId === channelId);
  //       return channel ? channel.data.title : 'Unbekannter Kanal';
  //     });
  //     return {
  //       ...user,
  //       channelTitles  // Array von Kanaltiteln hinzufügen
  //     };
  //   });
  // }

  updateChannelTitles() {
    this.channelTitles = [];
    this.allUsers.forEach(user => {
      if (user.channels && Array.isArray(user.channels)) {
        user.channels.forEach(userChannelId => {
          if (typeof userChannelId === 'string') {
            const matchedChannel = this.allChannels.find(channel => channel.channelId === userChannelId);
            if (matchedChannel && matchedChannel.channelId && matchedChannel.title) {
              this.channelTitles.push({
                channelId: matchedChannel.channelId,
                title: matchedChannel.title
              });
            }
          }
        });
      }
    });
    console.log('Aktualisierte Kanaltitel:', this.channelTitles);
  }

}
