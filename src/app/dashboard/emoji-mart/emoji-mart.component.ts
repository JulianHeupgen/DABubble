import { Component, Input } from '@angular/core';
import { MatMenuTrigger, MatMenuModule } from '@angular/material/menu';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiCommunicationService } from '../../services/emoji-communication.service';
import { Message } from '../../models/message.class';

@Component({
  selector: 'app-emoji-mart',
  standalone: true,
  imports: [
    MatMenuTrigger,
    MatMenuModule,
    PickerComponent,
  ],
  templateUrl: './emoji-mart.component.html',
  styleUrl: './emoji-mart.component.scss'
})
export class EmojiMartComponent {
  @Input() emojiImg: string = ''
  @Input() emojiImgHover: string = '';
  @Input() assigningComponent: string = '';
  @Input() threadId?: string;
  @Input() message!: Message;


  constructor(
    private emojiService: EmojiCommunicationService,
  ) { }

  
  /**
 * Handles the addition of an emoji to a message.
 * Emits an emoji event using `emojiService.emitEmojiEvent`.
 * If a message is present, includes the emoji's native representation, sender information,
 * timestamp of the message, and the message itself.
 * If no message is present, includes only the emoji's native representation and sender information.
 *
 * @param {any} event - The event object containing the emoji data.
 */
  addEmoji(event: any) {
    const sender = this.assigningComponent;
    if (this.message) {
      this.emojiService.emitEmojiEvent(event.emoji.native, sender, this.message.timestamp, this.message);
    } else {
      this.emojiService.emitEmojiEvent(event.emoji.native, sender);
    }
  }
}

