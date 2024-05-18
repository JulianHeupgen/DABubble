import { Component, Input } from '@angular/core';
import { MatMenuTrigger, MatMenuModule } from '@angular/material/menu';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiCommunicationService } from '../../services/emoji-communication.service';

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
  @Input() emojiToMessageBox: boolean = true;
  @Input() timestamp?: string;

  constructor(
    private emojiService: EmojiCommunicationService,
  ) { }

  addEmoji(event: any) {
    const sender = this.emojiToMessageBox ? 'ChannelChatComponent' : 'ChannelThreadComponent';
    const timestampId = this.timestamp || '';
    this.emojiService.emitEmojiEvent(event.emoji.native, sender, timestampId);
  }
}
