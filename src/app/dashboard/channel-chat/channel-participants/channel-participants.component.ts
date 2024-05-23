import { Component, Input } from '@angular/core';
import { Channel } from '../../../models/channel.class';
import { CommonModule } from '@angular/common';

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


  channelParticipants!: any[];
  

  ngOnInit() {
    this.getChannelParticipants();
  }


  getChannelParticipants() {
    this.channelParticipants = [];
    this.currentChannel.participants.forEach((participant) => {
      this.users.some((user: any) => {   // some statt forEach für bessere Performance (vorzeitiger Abbruch der inneren Schleife wenn true returned wird)
        if(participant == user.id) {
          this.channelParticipants.push(user);
          return true;           // gesuchter User gefunden; innere Schleife kann vorzeitig beendet werden; weitere User müssen nicht verglichen werden !
        }
        return false;
      });
    })
  }


}

