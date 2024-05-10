import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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
import { Thread } from '../../models/thread.class';

@Component({
  selector: 'app-channel-chat',
  standalone: true,
  imports: [MatCard, MatCardHeader, MatCardContent, MatFormField, MatLabel,  MatList, MatListModule, CommonModule, ChannelThreadComponent],
  templateUrl: './channel-chat.component.html',
  styleUrl: './channel-chat.component.scss'
})
export class ChannelChatComponent  {

  constructor(private dataService: DataService,
              private route: ActivatedRoute,
              private router: Router,
              private storage: StorageService,
              private auth: AuthService) {
                this.router.events.subscribe(event => {   
                  if (event instanceof NavigationEnd) {
                    this.ngOnInit(); 
                  }
                });
              }
 

  userAuthId!: string;
  users: any;
  currentUser!: User;
  channels: any;
  channelId: string = '';
  currentChannel!: Channel;
  channelParticipants: any = [];
  channelParticipantsCounter: number = 0;
  threads: any;
  channelThreads!: Thread[];

  
  async ngOnInit() {
    this.channelParticipants = [];         
    this.channelParticipantsCounter= 0;

    await this.checkUserAuthId();

    setTimeout(() => {
      this.searchCurrentChannel();
      this.showChannelParticipants(this.channelId);
      this.getChannelThreads(this.channelId);
    }, 600);
  }


  async checkUserAuthId() {
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
     this.findCurrentUser(this.userAuthId);
    }, 300);
  }


  async findCurrentUser(authId: string) {
    await this.dataService.getUsersList();
    this.users = this.dataService.allUsers;
    
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].authUserId === authId) {
          this.currentUser = new User(this.users[i]);            
          break; 
        }
      }
    }


    async searchCurrentChannel() {
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


    async showChannelParticipants(channelId: string) {
      await this.users.forEach((user:any) => {
        if (user.channels && user.channels.includes(channelId)) {
          this.channelParticipants.push( {
            participantImage: user.imageUrl
          } 
        );
        this.channelParticipantsCounter++;
      }
      });
    }


    async getChannelThreads(channelId: string) {
      await this.dataService.getThreadsList();
      this.threads = this.dataService.allThreads;

      this.channelThreads = [];

      for (let i=0; i < this.threads.length; i++) {
        if (this.threads[i].channelId === channelId ) {
          this.channelThreads.push(new Thread( this.threads[i] ));
        }
      }
    } 
    
}
  
