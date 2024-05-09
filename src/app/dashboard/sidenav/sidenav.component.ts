import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule, MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { DataService } from '../../services/data.service';
import { User } from '../../models/user.class';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { collection, DocumentData, Firestore, onSnapshot, query, where } from '@angular/fire/firestore';


@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    MatSidenavModule,
    CommonModule,
    MatButtonModule,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent

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
  allUsers: User[] = [];
  private unsubscribe!: () => void ;

  constructor(private dataService: DataService, private activatedRoute: ActivatedRoute, private authService: AuthService, private firestore: Firestore) {
    this.loadData();
  }


  ngOnInit() {
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
      } else {
        console.log('Keine UID verfügbar');
        this.allUsers = [];
      }
    } catch (error) {
      console.error('Fehler beim laden:', error);
      this.allUsers = [];
    }
  }

  setupUserSubscription(uid: string) {
    const usersRef = collection(this.firestore, 'users'); // Beziehen der 'users' Kollektion aus Firestore
    const q = query(usersRef, where('authUserId', '==', uid)); // Abfrage erstellen, die auf spezifische UID filtert
  
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      this.allUsers = snapshot.docs.map(doc => new User({ // Direkte Umwandlung der Dokumentdaten in User-Objekte
        id: doc.id,
        name: doc.data()['name'] || 'Unbekannter Name',
        email: doc.data()['email'] || 'keine-email@example.com',
        onlineStatus: doc.data()['onlineStatus'] || 'offline',
        authUserId: doc.data()['authUserId'],
        imageUrl: doc.data()['imageUrl'] || 'default-image.png',
        channels: [],  // Angenommen, diese Felder werden initial leer gesetzt oder später gefüllt
        userChats: []
      }));
      console.log('Aktualisierte Benutzerdaten:', this.allUsers);
    }, (error) => {
      console.error('Fehler beim Abonnieren der Benutzerdaten:', error);
    });
  }

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe(); // Listener bei Bedarf abmelden
  }

}
