import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Message } from '../models/message.class';

@Injectable({
  providedIn: 'root'
})
export class EmojiCommunicationService {

  private emojiEventSource = new Subject<any>();
  emojiEvent$ = this.emojiEventSource.asObservable();

  emitEmojiEvent(emoji: any, sender: string, messageTimestamp?: Number, message?: Message) {
    this.emojiEventSource.next({ emoji, sender, messageTimestamp, message });
  }
}
