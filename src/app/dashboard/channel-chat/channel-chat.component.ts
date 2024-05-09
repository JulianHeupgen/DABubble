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
import { User } from '../../models/user.class';

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
  currentUser!: User;

  
  async ngOnInit() {
    await this.checkUserId();
    this.checkChannelId();
  }

  async checkUserId() {
    await this.auth.getUserAuthId().then(userId => {
      if (userId) {
        this.userAuthId = userId;
        console.log("User ID:", this.userAuthId);
      } else {
        console.log("Kein Benutzer angemeldet.");
      }
    }).catch(error => {
      console.error("Fehler beim Abrufen der Benutzer-ID:", error);
    });

    setTimeout(() => {
     this.findUser(this.userAuthId);
    }, 300);
  }


  async findUser(authId: string) {
    await this.dataService.getUsersList();
    this.users = this.dataService.allUsers;
    
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].authUserId === authId) {
          this.currentUser = new User(this.users[i]);             
          break; 
        }
      }

    }

    checkChannelId() {
    this.route.params.subscribe(params => {   
      this.channelId = params['id'];       
      });
      console.log(this.channelId);
    }


  }

