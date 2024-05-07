import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatList, MatListModule } from '@angular/material/list';
import { Channel } from '../../models/channel.class';
import { StorageService } from '../../services/storage.service';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-channel-chat',
  standalone: true,
  imports: [MatCard, MatCardHeader, MatCardContent, MatFormField, MatLabel,  MatList, MatListModule, CommonModule],
  templateUrl: './channel-chat.component.html',
  styleUrl: './channel-chat.component.scss'
})
export class ChannelChatComponent {

  constructor(private dataService: DataService, private route: ActivatedRoute, private storage: StorageService) {}

  // in ngOnInit() die ID aus der URL extrahieren und anahand der id prüfen, welcher Channel angezeigt wird !
  ngOnInit() {
    this.route.params.subscribe(params => {
    this.channelId = params['id'];            
    });
  }


  users: any;
  channels: any;
  threads: any;

  getDataFromFirestore() {                               
    this.dataService.getUsersList();
    this.dataService.getChannelsList();
    this.dataService.getThreadsList();
    this.users = this.dataService.allUsers;
    this.channels = this.dataService.allChannels;
    this.threads = this.dataService.allThreads;
    console.log(this.users);
    console.log(this.channels);
    console.log(this.threads);
  }

  /* 
    Daniel Sidenav: Klick auf einen Channel und dieser leitet per routerLink an eine bestimmte URL [routerLink]=["channels", id];
    localStorage userId auslesen / das ist die authentID, diese abgleichen mit authent-id aus firebase, damit man weiß welche User angemeldet ist
    (dafür könnte man einen Service anlegen !);
    In ChannelChatComponent wird URL ausgelesen (in NgOnInit) und die id geprüft: id ermittelt den gesuchten Channel beim
    angemeldeten User (vorher noch getChannelsList() );
    In Variable "currentChannel" dann korrekten Channel speichern und dann die Inhalte/Threads rendern (vorher noch getThreadsList() );
    in html template ergänzen [ngIf]="currentChannel", sodass Inhalte erst gerendert werden sobald currentChannel die
    Inhalte von Firebase hat
  */ 

  channelId: string = '';
  currentChannel!: Channel;

               
  



  
  test!: File;

  uploadFile() {
    this.storage.uploadFile(this.test);
  }                           

}

