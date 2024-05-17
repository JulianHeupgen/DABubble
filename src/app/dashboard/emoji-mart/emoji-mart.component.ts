import { Component, ElementRef, ViewChild } from '@angular/core';
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

  constructor(
    private channelChat: ChannelChatComponent
  ) { }

  addEmoji(event: any) {
    let textAreaElement = this.channelChat.threadMessageBox.nativeElement;
    textAreaElement.value += event.emoji.native;
  }
}
