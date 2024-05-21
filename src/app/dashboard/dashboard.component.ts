import { Component } from '@angular/core';
import { ChannelChatComponent } from './channel-chat/channel-chat.component';
import { UserChatComponent } from './user-chat/user-chat.component';
import { HeaderComponent } from './header/header.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { RouterOutlet } from '@angular/router';
import { FullThreadComponent } from './full-thread/full-thread.component';
import { Thread } from '../models/thread.class';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, SidenavComponent, RouterOutlet, ChannelChatComponent, UserChatComponent, FullThreadComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  constructor( ) { }



}
