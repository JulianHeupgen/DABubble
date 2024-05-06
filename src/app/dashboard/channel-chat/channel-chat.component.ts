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

  ngOnInit() {
    this.route.params.subscribe(params => {
    this.channelId = params['id'];            
    });
  }


  users: any;

  getUsers() {                               
    this.dataService.getUsersList();
    this.users = this.dataService.allUsers;
    console.log(this.users);
  }

  /* 
    Daniel Sidenav: Klick auf einen Channel und dieser leitet per routerLink an eine bestimmte URL;
    In ChannelChatComponent wird URL ausgelesen (in NgOnInit) und die id geprüft: id ermittelt den gesuchten Channel (vorher noch getChannelsList() );
    In Variable "currentChannel" dann korrekten Channel speichern und dann die Inhalte rendern;
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

