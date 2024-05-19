import { Component, Input } from '@angular/core';
import { User } from '../../../models/user.class';
import { EmojiCommunicationService } from '../../../services/emoji-communication.service';
import { Message } from '../../../models/message.class';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-message-reaction',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './message-reaction.component.html',
  styleUrl: './message-reaction.component.scss'
})
export class MessageReactionComponent {
  @Input() threadMessage!: any;
  @Input() currentUser!: User;
  @Input() threadId!: string;
  emojiSubscription: Subscription;

  constructor(
    private emojiService: EmojiCommunicationService,
  ) {
    this.emojiSubscription = this.emojiService.emojiEvent$.subscribe(event => {
      if (event.sender === 'MessageReactionComponent' && event.threadId === this.threadId) {
        this.reactToThread(this.threadMessage, event.emoji);
      }
    });


  }

  ngOnInit() {
    console.log('threadMessage', this.threadMessage);
    console.log('currentUser', this.currentUser);
  }

  reactToThread(threadMessage: any, userReaction: string) {
    console.log('react', this, userReaction);

    let chatReactions = threadMessage.emojiReactions;
    // let user = this.currentUser;
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
      this.getNewReactionToMessage(threadMessage, userReaction);
    }
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
    chatReaction.users.push(this.currentUser);
  }

  getNewReactionToMessage(threadMessage: any, userReaction: string) {
    let threadReaction = {
      reaction: userReaction,
      users: [this.currentUser],
      count: 1
    };
    threadMessage.emojiReactions.push(threadReaction);
  }

  ngOnDestroy() {
    this.emojiSubscription.unsubscribe();
  }
}
