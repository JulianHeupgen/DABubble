import { Component, Input } from '@angular/core';
import { Channel } from '../../../models/channel.class';
import { CommonModule } from '@angular/common';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-channel-participants',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channel-participants.component.html',
  styleUrl: './channel-participants.component.scss'
})
export class ChannelParticipantsComponent {

  @Input() currentChannel!: Channel;
  @Input() users!: any;
  @Input() matMenuTrigger!: MatMenuTrigger;


  channelParticipants!: any[];
  

  ngOnInit() {
    this.getChannelParticipants();
  }


  getChannelParticipants() {
    this.channelParticipants = [];
    this.currentChannel.participants.forEach((participant) => {
      this.users.some((user: any) => {   
        if(participant == user.id) {
          this.channelParticipants.push(user);
          return true;           
        }
        return false;
      });
    })
  }


  closeMenu() {
    this.matMenuTrigger.closeMenu();
  }


}

