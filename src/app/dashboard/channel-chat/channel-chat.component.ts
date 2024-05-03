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

  currentChannel!: Channel;   /* 
                                 Daniel Sidenav: Klick auf einen Channel und dieser leitet per routerLink an eine bestimmte URL;
                                 In ChannelChatComponent wird URL ausgelesen (in NgOnInit) und die id geprüft: id ermittelt den gesuchten Channel;
                                 In Variable "currentChannel" die Channel Infos von Firebase laden und dann die Inhalte rendern;
                                 in html template ergänzen [ngIf]="currentChannel", sodass Inhalte erst gerendert werden sobald currentChannel die
                                 Inhalte von Firebase hat
                              */ 

}

