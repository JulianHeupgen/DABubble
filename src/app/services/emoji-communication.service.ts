import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Message } from '../models/message.class';

@Injectable({
  providedIn: 'root'
})
export class EmojiCommunicationService {

  private emojiEventSource = new Subject<any>();
  emojiEvent$ = this.emojiEventSource.asObservable();

    /**
   * Emits an emoji event with the provided details. This event can be subscribed to
   * by other components or services to receive updates when an emoji event occurs.
   *
   * @param {any} emoji - The emoji data to be emitted.
   * @param {string} sender - The sender of the emoji event.
   * @param {Number} [messageTimestamp] - Optional timestamp of the message associated with the emoji event.
   * @param {Message} [message] - Optional message object associated with the emoji event.
   */
  emitEmojiEvent(emoji: any, sender: string, messageTimestamp?: Number, message?: Message) {
    this.emojiEventSource.next({ emoji, sender, messageTimestamp, message });
  }
}
