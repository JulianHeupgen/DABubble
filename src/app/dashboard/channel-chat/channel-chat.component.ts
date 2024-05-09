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

  /* Channel Header: Title von Channel rendern und die Participants !
    dann die Threads (ChannelThreadComponent) rendern (vorher noch getThreadsList() );
    in html template ergänzen [ngIf]="currentChannel", sodass Inhalte erst gerendert werden sobald currentChannel die
    Inhalte von Firebase hat
  */ 

  userAuthId!: string;
  users: any;
  currentUser!: User;
  channels: any;
  channelId: string = '';
  currentChannel!: Channel;
  threads: any;

  
  async ngOnInit() {
    await this.checkUserId();

    setTimeout(() => {
      this.checkChannelId();
    }, 600);
  }

  async checkUserId() {
    await this.auth.getUserAuthId().then(userId => {
      if (userId) {
        this.userAuthId = userId;
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


    async checkChannelId() {
    this.route.params.subscribe(params => {   
      this.channelId = params['id'];       
      });

      await this.dataService.getChannelsList();
      this.channels = this.dataService.allChannels;

      for (let i = 0; i < this.channels.length; i++) {
        if (this.channels[i].id === this.channelId) {
            this.currentChannel = new Channel(this.channels[i]);     
            break; 
          }
        }
    }

  }
  
