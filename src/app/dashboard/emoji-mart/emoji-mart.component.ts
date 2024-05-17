import { Component, Input } from '@angular/core';
import { MatMenuTrigger, MatMenuModule } from '@angular/material/menu';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { ChannelChatComponent } from '../channel-chat/channel-chat.component';

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
  @Input() emojiImg: string = 'emoticon.png'
  @Input() emojiImgHover: string = 'emoticon-hover.png';

  constructor(
    private channelChat: ChannelChatComponent
  ) { }

  addEmoji(event: any) {
    let textAreaElement = this.channelChat.threadMessageBox.nativeElement;
    textAreaElement.value += event.emoji.native;
  }
}
