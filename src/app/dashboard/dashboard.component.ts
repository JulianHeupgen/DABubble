import { Component } from '@angular/core';
import { ChannelChatComponent } from './channel-chat/channel-chat.component';
import { UserChatComponent } from './user-chat/user-chat.component';
import { HeaderComponent } from './header/header.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ThreadComponent } from './thread/thread.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, SidenavComponent, RouterOutlet, ChannelChatComponent, UserChatComponent, ThreadComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
