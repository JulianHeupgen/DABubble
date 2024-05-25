import { Component, Input, SimpleChanges } from '@angular/core';
import { Channel } from '../../../models/channel.class';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ViewProfileComponent } from '../../../dialog/view-profile/view-profile.component';
import { AddUsersComponent } from '../../../dialog/add-users/add-users.component';


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
  

  channelParticipants!: any[];
  

  ngOnInit() {
    this.spliceCurrentUser();
    this.getChannelParticipants();
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentChannel']) {
      this.spliceCurrentUser();
      this.getChannelParticipants();
    }
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


  openAddUsersDialog() {
    this.dialog.open(AddUsersComponent, {
      data: { channelId: this.currentChannel.channelId }
    });
  }

}

