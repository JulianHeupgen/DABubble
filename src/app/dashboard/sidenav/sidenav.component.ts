import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule, MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { DataService } from '../../services/data.service';
import { User } from '../../models/user.class';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { collection, Firestore, onSnapshot, query, where } from '@angular/fire/firestore';
import { Channel } from '../../models/channel.class';
import { Subscription } from 'rxjs';
import { user } from '@angular/fire/auth';


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
  allUsers: Partial<User>[] = [];
  allChannels: Partial<Channel>[] = [];
  channelTitles: { channelId: string, title: string }[] = [];
  // private unsubscribe!: () => void;
  // private unsubscribeChannels!: () => void;

  private userSub: Subscription = new Subscription();
  private channelSub: Subscription = new Subscription();

  constructor(private dataService: DataService, private activatedRoute: ActivatedRoute, private authService: AuthService, private firestore: Firestore) {
    this.users = [];
    console.log('Constructor', this.users);
  }


  async ngOnInit() {
    this.dataSubscriptions();
    console.log('OnInit', this.allUsers);
  }

  dataSubscriptions() {
    this.userSub = this.dataService.getUsersList().subscribe(users => {
      this.users = users;
      this.authService.getUserAuthId().then(uid => {
        if (uid) {
          this.setupUserSubscription(uid);
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
      console.log('Channels', this.channels);

    });
  }

  checkDataForChannelNames() {
    if (this.users && this.channels) {
      this.updateChannelTitles();
    }
  }

  getDataFromFirestore(): User[] {
    return this.dataService.allUsers;
  }

  setupUserSubscription(uid: string) {
    if (!this.users) {
      console.error('Benutzerdaten sind noch nicht geladen.');
      return;
    }

    const user = this.users.find((user: User) => user.authUserId === uid);

    if (user) {
      console.log('User gefunden', user);
      this.allUsers = [];

      this.allUsers.push(user);
      console.log('TEST', this.allUsers);

    } else {
      console.log('Kein User gefunden', uid);
    }
  }


  //   setupChannelsSubscription() {
  //     const channelsRef = collection(this.firestore, 'channels');
  //     this.unsubscribeChannels = onSnapshot(channelsRef, (snapshot) => {
  //       this.allChannels = snapshot.docs.map(doc => {
  //         const data = doc.data();
  //         return {
  //           channelId: doc.id,
  //           title: data['title'] || '',
  //           participants: data['participants'] || [],
  //           threads: data['threads'] || []
  //         };
  //       });
  //       console.log('Aktualisierte Kanaldaten:', this.allChannels);
  //     }, (error) => {
  //       console.error('Fehler beim Abonnieren der Kanaldaten:', error);
  //     });
  // }


  updateChannelTitles() {
    this.channelTitles = [];
    console.log('ALL CHANNELS', this.dataService.allChannels);

    this.allUsers.forEach(user => {
      if (user.channels && Array.isArray(user.channels)) {
        user.channels.forEach(userChannelId => {
          console.log('USERCHANNELID', userChannelId);
          const matchedChannel = this.dataService.allChannels.find((channel: Channel) => {
            console.log('CHANNEL VARIABLE', channel);
            if (!channel['channelId']) {
              console.warn('CHANNEL VARIABLE', channel);
            }
            console.log('CHANNEL VARIABLE', channel);

            return channel.channelId === userChannelId
          });


          console.log('match', matchedChannel);
          if (matchedChannel && matchedChannel.channelId && matchedChannel.title) {
            this.channelTitles.push({
              channelId: matchedChannel.channelId,
              title: matchedChannel.title
            });
          }
        });
      }
    });
    console.log('Aktualisierte Kanaltitel:', this.channelTitles);
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




  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.channelSub) {
      this.channelSub.unsubscribe();
    }
  }

}
