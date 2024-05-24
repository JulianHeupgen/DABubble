import { Component, Input } from '@angular/core';
import { Channel } from '../../../models/channel.class';
import { CommonModule } from '@angular/common';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { ViewProfileComponent } from '../../../dialog/view-profile/view-profile.component';


@Component({
  selector: 'app-channel-participants',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channel-participants.component.html',
  styleUrl: './channel-participants.component.scss'
})
export class ChannelParticipantsComponent {

  constructor(public dialog: MatDialog) {}

  @Input() currentChannel!: Channel;
  @Input() users!: any;
  @Input() currentUser!: any;
  @Input() matMenuTrigger!: MatMenuTrigger;

  channelParticipants!: any[];
  

  ngOnInit() {
    this.spliceCurrentUser();
    this.getChannelParticipants();
  }


  spliceCurrentUser() {
    let index = this.currentChannel.participants.indexOf(this.currentUser.id);
    if (index != -1) {
      this.currentChannel.participants.splice(index,1);
    }
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


  showProfile(participant: any) {
     this.dialog.open(ViewProfileComponent, {
       data: participant
     }
    );
  }


  closeMenu() {
    this.matMenuTrigger.closeMenu();
  }

}

