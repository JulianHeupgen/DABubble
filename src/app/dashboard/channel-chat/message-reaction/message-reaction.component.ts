import { Component, Input } from '@angular/core';
import { User } from '../../../models/user.class';
import { EmojiCommunicationService } from '../../../services/emoji-communication.service';
import { Message } from '../../../models/message.class';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Thread } from '../../../models/thread.class';
import { DataService } from '../../../services/data.service';

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
  @Input() thread!: Thread;
  emojiSubscription: Subscription;

  constructor(
    private emojiService: EmojiCommunicationService,
    private dataService: DataService
  ) {
    this.emojiSubscription = this.emojiService.emojiEvent$.subscribe(event => {
      if (event.sender === 'MessageReactionComponent' && event.threadId === this.thread.threadId) {
        this.reactToThread(this.threadMessage, event.emoji);
      }
    });


  }

  reactToThread(threadMessage: any, userReaction: string) {
    let chatReactions = threadMessage.emojiReactions;
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
    this.updateThreadInFirebase();
  }

  updateThreadInFirebase() {
    const threadCopy = new Thread({ ...this.thread });
    threadCopy.messages = [...this.thread.messages];
    this.convertThreadMessagesToString(threadCopy);
    this.dataService.updateThread(threadCopy).then(() => {
      console.log('Thread successfully updated in Firebase');
    }).catch(err => {
      console.error('Update failed', err);
    });
  }

  convertThreadMessagesToString(thread: any) {
    let threadMessages: string[] = [];
    thread.messages.forEach((message: any) => {
      threadMessages.push(JSON.stringify(message));
    });
    thread.messages = threadMessages;
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
