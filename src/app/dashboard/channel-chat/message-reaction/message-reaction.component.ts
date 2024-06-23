import { Component, Input } from '@angular/core';
import { User } from '../../../models/user.class';
import { EmojiCommunicationService } from '../../../services/emoji-communication.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Thread } from '../../../models/thread.class';
import { DataService } from '../../../services/data.service';
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
  @Input() userChatId!: string | undefined;
  @Input() userChatIndex!: number | undefined;

  usersForReaction: User[] = [];

  emojiSubscription: Subscription;


  /**
 * Constructs an instance of the component.
 * Initializes with instances of EmojiCommunicationService, DataService, and ThreadService.
 * Subscribes to emoji events from EmojiCommunicationService to react to message reactions.
 * Reacts to thread messages based on the received emoji event, if the sender matches 'MessageReactionComponent' and the message timestamp matches.
 *
 * @param {EmojiCommunicationService} emojiService - The service for emoji communication.
 * @param {DataService} dataService - The service for data operations.
 * @param {ThreadService} threadService - The service for thread operations.
 */
  constructor(
    private emojiService: EmojiCommunicationService,
    private dataService: DataService,
    private threadService: ThreadService,
  ) {
    this.emojiSubscription = this.emojiService.emojiEvent$.subscribe(event => {
      if (event.sender === 'MessageReactionComponent' && event.messageTimestamp === this.threadMessage.timestamp) {
        this.reactToThread(this.threadMessage, event.emoji);
      }
    });
  }


  /**
 * Initializes the component.
 * Subscribes to `currentMessages$` from `threadService` to listen for updates related to emoji reactions.
 * Processes emoji reactions for all users.
 */
  ngOnInit() {
    this.usersForReaction = [];
    this.threadService.currentMessages$.subscribe(event => {
      if (event.update === 'updateReaction') {
        if (event.thread) {
          this.thread = event.thread;
          this.processEmojiReactions();
        }
      }
    });
    this.processEmojiReactions();
  }


  /**
 * Processes emoji reactions for all users.
 * Iterates through all users and retrieves their emoji reactions.
 * Updates the thread message emoji reactions after processing.
 */
  processEmojiReactions() {
    this.dataService.allUsers.forEach(user => {
      this.getEmojiReactions(user);
    });
    this.updateThreadMessageReactions();
  }


  /**
 * Retrieves emoji reactions for a specific user.
 * Searches for the user in each emoji reaction and updates `usersDetail` if found.
 *
 * @param {User} user - The user to retrieve emoji reactions for.
 */
  getEmojiReactions(user: User) {
    this.threadMessage.emojiReactions.forEach((emojiReaction: any) => {
      this.searchUserInReactions(user, emojiReaction);
    });
  }


  /**
 * Searches for a user in an emoji reaction and updates `usersDetail` if found.
 *
 * @param {User} user - The user to search for in the emoji reaction.
 * @param {any} emojiReaction - The emoji reaction object to search within.
 */
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


  /**
 * Updates the thread message emoji reactions by transferring data from `usersDetail` to `users`.
 * Removes `usersDetail` after updating.
 */
  updateThreadMessageReactions() {
    this.threadMessage.emojiReactions = this.threadMessage.emojiReactions.map((reaction: any) => {
      reaction.users = reaction.usersDetail || reaction.users;
      delete reaction.usersDetail;
      return reaction;
    });
  }


  /**
 * Reacts to a thread message with an emoji reaction.
 * Manages adding, updating, or removing emoji reactions based on user actions.
 * Copies the thread to Firebase after processing reactions.
 *
 * @param {any} threadMessage - The thread message to react to.
 * @param {string} userReaction - The emoji reaction from the user.
 */
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
    if (this.thread.channelId.length > 1) {
      this.threadService.copyThreadForFirebase(this.thread);
    } else {
      this.threadService.copyUserChatThreadForFirebase(this.thread, this.userChatId, this.userChatIndex)
    }
    this.processEmojiReactions();
  }


  /**
 * Checks if the current user is already in an emoji reaction.
 *
 * @param {any} chatReaction - The emoji reaction to check.
 * @returns {number} - The index of the user in the reaction array, or -1 if not found.
 */
  isUserInReaction(chatReaction: any) {
    return chatReaction.users.findIndex((u: any) => u.id === this.currentUser.id);
  }


  /**
 * Handles the case where the current user reacts again with the same emoji.
 * Decreases the reaction count and removes the user from the reaction.
 * Removes the entire reaction if the count reaches zero.
 *
 * @param {any} chatReactions - The list of emoji reactions.
 * @param {any} chatReaction - The specific emoji reaction to handle.
 */
  userReactionagain(chatReactions: any, chatReaction: any) {
    let userIndex = chatReaction.users.findIndex((u: any) => u.id === this.currentUser.id);
    chatReaction.count--;
    chatReaction.users.splice(userIndex, 1);
    if (chatReaction.count === 0) {
      const index = chatReactions.indexOf(chatReaction);
      chatReactions.splice(index, 1);
    }
  }


  /**
 * Increases the reaction count and adds the current user to the emoji reaction.
 *
 * @param {any} chatReaction - The emoji reaction to update.
 */
  raiseReactionCount(chatReaction: any) {
    chatReaction.count++;
    chatReaction.users.push(this.currentUser);
  }

  
  /**
 * Adds a new emoji reaction to the thread message for the current user.
 *
 * @param {any} threadMessage - The thread message to add the reaction to.
 * @param {string} userReaction - The emoji reaction from the user.
 */
  getNewReactionToMessage(threadMessage: any, userReaction: string) {
    let threadReaction = {
      reaction: userReaction,
      users: [this.currentUser],
      count: 1
    };
    threadMessage.emojiReactions.push(threadReaction);
  }


  /**
 * Cleans up resources when the component is destroyed.
 * Unsubscribes from `emojiSubscription` to prevent memory leaks.
 */
  ngOnDestroy() {
    this.emojiSubscription.unsubscribe();
  }
}

