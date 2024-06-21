import { Component } from '@angular/core';
import { ChannelChatComponent } from './channel-chat/channel-chat.component';
import { UserChatComponent } from './user-chat/user-chat.component';
import { HeaderComponent } from './header/header.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { RouterOutlet } from '@angular/router';
import { FullThreadComponent } from './full-thread/full-thread.component';
import { CommonModule } from '@angular/common';
import { ThreadService } from '../services/thread.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, SidenavComponent, RouterOutlet, ChannelChatComponent, UserChatComponent, FullThreadComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  openThread: boolean = false;

   /**
   * Constructor that subscribes to the openCurrentThread$ observable from the thread service.
   * 
   * @param {ThreadService} threadService - The service for managing thread operations.
   */
  constructor(public threadService: ThreadService) {
    this.threadService.openCurrentThread$.subscribe(openThreadBoolean => {
        this.openThread = openThreadBoolean;      
    });
   }
}
