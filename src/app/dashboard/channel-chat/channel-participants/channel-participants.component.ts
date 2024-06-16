import { Component, Input, SimpleChanges } from '@angular/core';
import { Channel } from '../../../models/channel.class';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ViewProfileComponent } from '../../../dialog/view-profile/view-profile.component';
import { AddUsersComponent } from '../../../dialog/add-users/add-users.component';
import { DataService } from '../../../services/data.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-channel-participants',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channel-participants.component.html',
  styleUrl: './channel-participants.component.scss'
})
export class ChannelParticipantsComponent {

  constructor(public dialog: MatDialog, public dataService: DataService) {}

  @Input() currentChannel!: Channel;
  @Input() users!: any;
  @Input() currentUser!: any;
  
  channelParticipants!: any[];

  private channelParticipantsSub!: Subscription;
  

  ngOnInit() {
    this.spliceCurrentUser();
    this.getChannelParticipants();
    this.getParticipantInfosSub();
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

  getParticipantInfosSub() {
    if (this.channelParticipantsSub) {
      this.channelParticipantsSub.unsubscribe();
    }
    this.channelParticipantsSub = this.dataService.getParticipantInfos(this.currentChannel.channelId).subscribe((channelParticipants: any) => {
      this.channelParticipants = channelParticipants;
    })
  }


  showProfile(participant: any) {
     this.dialog.open(ViewProfileComponent, {
       data: participant
    });
  }


  openAddUsersDialog() {
    this.dialog.open(AddUsersComponent, {
      data: { 
        channelId: this.currentChannel.channelId,
        currentChannel: this.currentChannel }
    });
  }

}

