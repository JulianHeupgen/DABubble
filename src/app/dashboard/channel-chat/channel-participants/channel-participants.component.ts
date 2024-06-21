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


  /**
 * Responds to changes in the input properties of the component.
 *
 * @param {SimpleChanges} changes - An object that holds the current and previous values of the component's input properties.
 */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentChannel']) {
      this.spliceCurrentUser();
      this.getChannelParticipants();
    }
  }


  /**
 * Removes the current user from the participants list of the current channel.
 */
  spliceCurrentUser() {
    let index = this.currentChannel.participants.indexOf(this.currentUser.id);
    if (index != -1) {
      this.currentChannel.participants.splice(index,1);
    }
  }
  

  /**
 * Retrieves and sets the list of participants for the current channel.
 * It iterates over the participants in the current channel and adds the corresponding user objects
 * to the `channelParticipants` array.
 */
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


  /**
 * Subscribes to participant information updates for the current channel.
 * If there is an existing subscription, it will unsubscribe before creating a new one.
 * The retrieved participant information is then processed to remove the current user.
 */
  getParticipantInfosSub() {
    if (this.channelParticipantsSub) {
      this.channelParticipantsSub.unsubscribe();
    }
    this.channelParticipantsSub = this.dataService.getParticipantInfos(this.currentChannel.channelId).subscribe((channelParticipants: any) => {
      this.channelParticipants = this.spliceCurrentUserFromParticipants(channelParticipants, this.currentUser.id);
    })
  }


  /**
 * Removes the current user from the provided array of participants.
 *
 * @param {any[]} array - The array of participants.
 * @param {string} currentUserId - The ID of the current user to be removed from the participants array.
 * @returns {any[]} A new array with the current user removed.
 */
  spliceCurrentUserFromParticipants(array: any, currentUserId: string) {
    return array.filter((participant: any) => participant.id !== currentUserId);
  }


  /**
 * Opens a dialog to display the profile of the given participant.
 *
 * @param {any} participant - The participant whose profile is to be displayed.
 */
  showProfile(participant: any) {
     this.dialog.open(ViewProfileComponent, {
       data: participant
    });
  }


  /**
 * Opens a dialog to add users to the current channel.
 * The dialog is provided with the current channel's ID and the current channel object as data.
 */
  openAddUsersDialog() {
    this.dialog.open(AddUsersComponent, {
      data: { 
        channelId: this.currentChannel.channelId,
        currentChannel: this.currentChannel 
      }
    });
  }

}
