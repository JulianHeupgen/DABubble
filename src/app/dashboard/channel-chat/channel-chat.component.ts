import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatList, MatListModule } from '@angular/material/list';
import { Channel } from '../../models/channel.class';
import { StorageService } from '../../services/storage.service';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ChannelThreadComponent } from './channel-thread/channel-thread.component';

@Component({
  selector: 'app-channel-chat',
  standalone: true,
  imports: [MatCard, MatCardHeader, MatCardContent, MatFormField, MatLabel,  MatList, MatListModule, CommonModule, ChannelThreadComponent],
  templateUrl: './channel-chat.component.html',
  styleUrl: './channel-chat.component.scss'
})
export class ChannelChatComponent {

  constructor(private dataService: DataService, private route: ActivatedRoute, private storage: StorageService, private auth: AuthService) {}

  /* 
    Daniel Sidenav: Klick auf einen Channel und dieser leitet per routerLink an eine bestimmte URL [routerLink]=["channels", channel.id];
    authService: authID holen, diese abgleichen mit authent-id aus firebase, damit man weiß welche User angemeldet ist !
    In ChannelChatComponent wird URL ausgelesen (in NgOnInit) und die id geprüft: id ermittelt den gesuchten Channel beim
    angemeldeten User (vorher noch getChannelsList() );
    In Variable "currentChannel" dann korrekten Channel speichern und dann die Threads (ChannelThreadComponent) rendern (vorher noch getThreadsList() );
    in html template ergänzen [ngIf]="currentChannel", sodass Inhalte erst gerendert werden sobald currentChannel die
    Inhalte von Firebase hat
  */ 

  users: any;
  channels: any;
  threads: any;
  userAuthId!: string;
  channelId: string = '';
  currentChannel!: Channel;

  // mit authService in ngOnInit() prüfen, welcher User eingeloggt ist: Methode getUserAuthId(); dann dessen Channels usw laden
  // danach die ID aus der URL extrahieren und anahand der id prüfen, welcher Channel angezeigt wird !
  ngOnInit() {
    this.checkUserId();

    this.route.params.subscribe(params => {   // Channel-ID aus URL holen
    this.channelId = params['id'];            
    });
  }

  checkUserId() {
    this.auth.getUserAuthId().then(userId => {
      if (userId) {
        this.userAuthId = userId;
        console.log("User ID:", this.userAuthId);
      } else {
        console.log("Kein Benutzer angemeldet.");
      }
    }).catch(error => {
      console.error("Fehler beim Abrufen der Benutzer-ID:", error);
    });
  }


  // Test-Funktion um zu prüfen ob die Daten korrekt von Firestore geladen werden
  getDataFromFirestore() {                               
    this.dataService.getUsersList();
    this.dataService.getChannelsList();
    this.dataService.getThreadsList();
    this.users = this.dataService.allUsers;
    this.channels = this.dataService.allChannels;
    this.threads = this.dataService.allThreads;
  }             

}

