import { Component, Input } from '@angular/core';
import { User } from '../../../models/user.class';
import { EmojiCommunicationService } from '../../../services/emoji-communication.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Thread } from '../../../models/thread.class';
import { DataService } from '../../../services/data.service';
import { Unsubscribe } from '@angular/fire/auth';
import { Firestore, doc, onSnapshot } from '@angular/fire/firestore';
import { ThreadService } from '../../../services/thread.service';

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

  usersForReaction: User[] = [];

  // private threadUnsubscribe!: Unsubscribe;
  emojiSubscription: Subscription;

  constructor(
    private emojiService: EmojiCommunicationService,
    private dataService: DataService,
    private threadService: ThreadService,
    // private firebase: Firestore,
  ) {
    this.emojiSubscription = this.emojiService.emojiEvent$.subscribe(event => {
      if (event.sender === 'MessageReactionComponent' && event.messageTimestamp === this.threadMessage.timestamp) {
        this.reactToThread(this.threadMessage, event.emoji);
      }
    });
  }

  ngOnInit() {
    this.usersForReaction = [];
    this.threadService.currentMessages$.subscribe(event => {
      if (event.update = 'updateReaction') {
        if (event.thread) {
          this.thread = event.thread;
          console.log('event', event.thread);
          this.dataService.allUsers.forEach(user => {
            this.getEmojiReactions(user);
          })
          this.updateThreadMessageReactions();
        }
      }
    });
    this.dataService.allUsers.forEach(user => {
      this.getEmojiReactions(user);
    });
    this.updateThreadMessageReactions();
  }

  getEmojiReactions(user: User) {
    this.threadMessage.emojiReactions.forEach((emojiReaction: any) => {
      this.searchUserInReactions(user, emojiReaction);
    });
  }

  searchUserInReactions(user: User, emojiReaction: any) {
    emojiReaction.users.forEach((reactionUserId: string) => {
      if (reactionUserId === user.id) {
        if (!emojiReaction.usersDetail) {
          emojiReaction.usersDetail = [];
        }
        emojiReaction.usersDetail.push(user);
      }
    });
  }

  updateThreadMessageReactions() {
    // This function ensures that the threadMessage is updated with detailed user information
    this.threadMessage.emojiReactions = this.threadMessage.emojiReactions.map((reaction: any) => {
      reaction.users = reaction.usersDetail || reaction.users;
      delete reaction.usersDetail;
      return reaction;
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
    // this.threadUnsubscribe();
  }
}
