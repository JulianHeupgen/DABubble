import { Component, Input, ViewChild } from '@angular/core';
import { Thread } from '../../../models/thread.class';
import { CommonModule } from '@angular/common';
import { EmojiMartComponent } from '../../emoji-mart/emoji-mart.component';
import { ChannelChatComponent } from '../channel-chat.component';
import { User } from '../../../models/user.class';
import { Subscription } from 'rxjs';
import { EmojiCommunicationService } from '../../../services/emoji-communication.service';
import { MessageReactionComponent } from '../message-reaction/message-reaction.component';
import { FullThreadComponent } from '../../full-thread/full-thread.component';
import { DashboardComponent } from '../../dashboard.component';
import { DataService } from '../../../services/data.service';
import { ThreadService } from '../../../services/thread.service';

@Component({
  selector: 'app-channel-thread',
  standalone: true,
  imports: [
    CommonModule,
    MessageReactionComponent,
    EmojiMartComponent,
  ],
  templateUrl: './channel-thread.component.html',
  styleUrl: './channel-thread.component.scss'
})
export class ChannelThreadComponent {

  @Input() thread!: Thread;
  @ViewChild(MessageReactionComponent) messageReaction!: MessageReactionComponent;

  isCurrentUser: boolean = false;

  constructor(
    public channelChat: ChannelChatComponent,
    public dashboard: DashboardComponent,
    public dataService: DataService,
    private threadService: ThreadService,

  ) { }

  ngOnInit() {
    let currentUserId = this.channelChat.currentUser.id;
    let messageOwnderId = this.thread.messages[0].sender.id
    if (currentUserId == messageOwnderId) {
      this.isCurrentUser = true;
      console.log(this.isCurrentUser);
      
    }

  }

  formattedDatestamp(): any {
    return this.thread.getFormattedDatestamp();
  }

  formattedTimeStamp(): any {
    return this.thread.getFormattedTimeStamp();
  }

  openThread(thread: Thread) {
    this.threadService.changeThread(thread);
  }
}

