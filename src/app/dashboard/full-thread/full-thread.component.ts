import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EmojiMartComponent } from '../emoji-mart/emoji-mart.component';
import { Thread } from '../../models/thread.class';
import { MessageReactionComponent } from '../channel-chat/message-reaction/message-reaction.component';
import { ChannelChatComponent } from '../channel-chat/channel-chat.component';
import { User } from '../../models/user.class';
import { DataService } from '../../services/data.service';
import { ThreadService } from '../../services/thread.service';
import { ChannelThreadComponent } from '../channel-chat/channel-thread/channel-thread.component';
import { FullThreadMessageComponent } from './full-thread-message/full-thread-message.component';

@Component({
  selector: 'app-full-thread',
  standalone: true,
  imports: [
    CommonModule,
    EmojiMartComponent,
    MessageReactionComponent,
    FullThreadMessageComponent,
  ],
  templateUrl: './full-thread.component.html',
  styleUrl: './full-thread.component.scss'
})
export class FullThreadComponent {
  
  openThread: boolean = false;
  thread: Thread | null = null;

  constructor(
    private threadService: ThreadService,
  ) { }

  ngOnInit(): void {
    this.threadService.currentThread.subscribe(thread => {
      if (thread) {
        this.thread = thread;
        this.openThread = true;
        console.log('FullThread:', this.thread)
      }
    });
  }

  closeThread() {
    this.openThread = false;
  }

}
