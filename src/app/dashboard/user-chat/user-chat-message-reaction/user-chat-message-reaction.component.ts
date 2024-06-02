import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { EmojiCommunicationService } from '../../../services/emoji-communication.service';
import { User } from '../../../models/user.class';
import { Message } from '../../../models/message.class';
import { MessageService } from '../../../services/message.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-chat-message-reaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-chat-message-reaction.component.html',
  styleUrl: './user-chat-message-reaction.component.scss'
})
export class UserChatMessageReactionComponent {

  @Input() currentUser!: User;
  @Input() message!: any;

  usersForReaction: User[] = [];
  emojiSubscription: Subscription;

  constructor(
    private emojiService: EmojiCommunicationService,
    private dataService: DataService,
    private messageService: MessageService
  ) {
    this.emojiSubscription = this.emojiService.emojiEvent$.subscribe(event => {
      if (event.sender === 'UserChatMessageReactionComponent' && event.messageTimestamp === this.message.timestamp) {
        this.reactToMessage(this.message, event.emoji);
      }
    });
  }


  ngOnInit() {
    this.usersForReaction = [];
    this.messageService.currentMessages$.subscribe(event => {
      if (event.update === 'updateReaction') {
        if (event.thread) {
          this.message = event.thread;
          this.processEmojiReactions();
        }
      }
    });
    this.processEmojiReactions();
  }


  processEmojiReactions() {
    this.dataService.allUsers.forEach(user => {
      this.getEmojiReactions(user);
    });
    this.updateThreadMessageReactions();
  }


  getEmojiReactions(user: User) {
    this.message.emojiReactions.forEach((emojiReaction: any) => {
      this.searchUserInReactions(user, emojiReaction);
    });
  }


  searchUserInReactions(user: User, emojiReaction: any) {
    emojiReaction.users.forEach((reactionUserId: any) => {
      if (reactionUserId === user.id || reactionUserId.id === user.id) {
        if (!emojiReaction.usersDetail) {
          emojiReaction.usersDetail = [];
        }
        emojiReaction.usersDetail.push(user);
      }
    });
  }


  updateThreadMessageReactions() {
    this.message.emojiReactions = this.message.emojiReactions.map((reaction: any) => {
      reaction.users = reaction.usersDetail || reaction.users;
      delete reaction.usersDetail;
      return reaction;
    });
  }


  reactToMessage(message: any, userReaction: string) {
    let chatReactions = message.emojiReactions;
    let reactionExists = false;

    chatReactions.forEach((chatReaction: any) => {
      if (chatReaction.reaction === userReaction) {
        reactionExists = true;
        if (this.isUserInReaction(chatReaction) !== -1) {
          this.userReactionagain(chatReactions, chatReaction);
        } else {
          this.raiseReactionCount(chatReaction);
        }
      }
    });
    if (!reactionExists) {
      this.getNewReactionToMessage(message, userReaction);
    }
    this.messageService.copyMessageForFirebase(this.message);
  }


  isUserInReaction(chatReaction: any) {
    return chatReaction.users.findIndex((u: any) => u.id === this.currentUser.id);
  }


  userReactionagain(chatReactions: any, chatReaction: any) {
    let userIndex = chatReaction.users.findIndex((u: any) => u.id === this.currentUser.id);
    chatReaction.count--;
    chatReaction.users.splice(userIndex, 1);
    if (chatReaction.count === 0) {
      const index = chatReactions.indexOf(chatReaction);
      chatReactions.splice(index, 1);
    }
  }


  raiseReactionCount(chatReaction: any) {
    chatReaction.count++;
    chatReaction.users.push(this.currentUser.id);
  }


  getNewReactionToMessage(threadMessage: any, userReaction: string) {
    let threadReaction = {
      reaction: userReaction,
      users: [this.currentUser.id],
      count: 1
    };
    threadMessage.emojiReactions.push(threadReaction);
  }


  ngOnDestroy() {
    this.emojiSubscription.unsubscribe();
  }

}
