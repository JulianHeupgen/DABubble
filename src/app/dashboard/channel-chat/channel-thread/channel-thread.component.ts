import { Component, Input, ViewChild } from '@angular/core';
import { Thread } from '../../../models/thread.class';
import { CommonModule } from '@angular/common';
import { EmojiMartComponent } from '../../emoji-mart/emoji-mart.component';
import { ChannelChatComponent } from '../channel-chat.component';

@Component({
  selector: 'app-channel-thread',
  standalone: true,
  imports: [
    CommonModule,
    EmojiMartComponent,
  ],
  templateUrl: './channel-thread.component.html',
  styleUrl: './channel-thread.component.scss'
})
export class ChannelThreadComponent {

  @Input() thread!: Thread;

  @ViewChild(EmojiMartComponent) emojiMart!: EmojiMartComponent;

  constructor(
    private channelChat: ChannelChatComponent,
  ) {
    setTimeout(() => {
      console.log('Thread:', this.thread);
      console.log('ThreadMessage:', this.thread.messages[0].content);
    }, 1000);

  }

  formattedDatestamp(): any {
    return this.thread.getFormattedDatestamp();
  }

  formattedTimeStamp(): any {
    return this.thread.getFormattedTimeStamp();
  }

  reactToThread(message: any, userReaction: string) {
    let chatReactions = message.thread.messages[0].emojiReactions
    if (chatReactions.length > 0) {      
      chatReactions.forEach( (chatReaction: any) => {
        if (chatReaction.reaction === userReaction) {
          chatReaction.count ++;
        } else {
          let threadReaction = {
            reaction: userReaction,
            user: this.channelChat.currentUser,
            count: 1
          }
          message.thread.messages[0].emojiReactions.push(threadReaction)
        }
      })
    } else {
      let threadReaction = {
        reaction: userReaction,
        user: this.channelChat.currentUser,
        count: 1
      }
      message.thread.messages[0].emojiReactions.push(threadReaction)
    }
    
    console.log('Threadmessage is:', message.thread);
      
    
  }
}

