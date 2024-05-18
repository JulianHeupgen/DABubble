import { Component, Input, ViewChild } from '@angular/core';
import { Thread } from '../../../models/thread.class';
import { CommonModule } from '@angular/common';
import { EmojiMartComponent } from '../../emoji-mart/emoji-mart.component';
import { ChannelChatComponent } from '../channel-chat.component';
import { User } from '../../../models/user.class';

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
    let chatReactions = message.thread.messages[0].emojiReactions;
    let user = this.channelChat.currentUser;
    let reactionExists = false;

    chatReactions.forEach((chatReaction: any) => {
      if (chatReaction.reaction === userReaction) {
        reactionExists = true;
        if (this.isUserInReaction(chatReaction, user) !== -1) {  // User exists in reaction
          this.userReactionagain(chatReactions, chatReaction, user);
        } else {  // User does not exist in reaction
          this.raiseReactionCount(chatReaction, user);
        }
      }
    });
    if (!reactionExists) {
      this.getNewReactionToMessage(message, userReaction, user);      
    }
    console.log('Threadmessage is:', message.thread);
  }

  isUserInReaction(chatReaction: any, user: User) {
    return chatReaction.users.findIndex((u: any) => u.id === user.id);
  }

  userReactionagain(chatReactions: any, chatReaction: any, user: User) {
    let userIndex = chatReaction.users.findIndex((u: any) => u.id === user.id);
    chatReaction.count--;
    chatReaction.users.splice(userIndex, 1);
    // Remove reaction if no users are left
    if (chatReaction.count === 0) {
      const index = chatReactions.indexOf(chatReaction);
      chatReactions.splice(index, 1);
    }
  }

  raiseReactionCount(chatReaction: any, user: User) {
    chatReaction.count++;
    chatReaction.users.push(user);
  }

  getNewReactionToMessage(message: any, userReaction: string, user: User) {
    let threadReaction = {
      reaction: userReaction,
      users: [user],
      count: 1
    };
    message.thread.messages[0].emojiReactions.push(threadReaction);
  }
}

