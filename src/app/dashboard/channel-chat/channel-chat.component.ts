import { Component } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import {MatList, MatListModule} from '@angular/material/list';
import { Channel } from '../../models/channel.class';

@Component({
  selector: 'app-channel-chat',
  standalone: true,
  imports: [MatCard, MatCardHeader, MatCardContent, MatFormField, MatLabel,  MatList, MatListModule],
  templateUrl: './channel-chat.component.html',
  styleUrl: './channel-chat.component.scss'
})
export class ChannelChatComponent {

  currentChannel!: Channel;   // In dieser Variable die Channel Infos von Firebase laden und dann die Inhalte rendern

}

