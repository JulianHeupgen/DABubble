import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EmojiMartComponent } from '../emoji-mart/emoji-mart.component';
import { Thread } from '../../models/thread.class';
import { MessageReactionComponent } from '../channel-chat/message-reaction/message-reaction.component';
import { ChannelChatComponent } from '../channel-chat/channel-chat.component';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-full-thread',
  standalone: true,
  imports: [
    CommonModule,
    EmojiMartComponent,
    MessageReactionComponent,
  ],
  templateUrl: './full-thread.component.html',
  styleUrl: './full-thread.component.scss'
})
export class FullThreadComponent {
  
  openThread: boolean = false;

  constructor( ) { }

}
