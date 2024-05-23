import { Component, Input } from '@angular/core';
import { Channel } from '../../../models/channel.class';

@Component({
  selector: 'app-channel-participants',
  standalone: true,
  imports: [],
  templateUrl: './channel-participants.component.html',
  styleUrl: './channel-participants.component.scss'
})
export class ChannelParticipantsComponent {

  @Input() currentChannel!: Channel;
  
  

}

