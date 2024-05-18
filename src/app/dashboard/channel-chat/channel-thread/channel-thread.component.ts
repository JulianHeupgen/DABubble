import { Component, Input, ViewChild } from '@angular/core';
import { Thread } from '../../../models/thread.class';
import { CommonModule } from '@angular/common';
import { EmojiMartComponent } from '../../emoji-mart/emoji-mart.component';

@Component({
  selector: 'app-channel-thread',
  standalone: true,
  imports: [
    CommonModule,
    EmojiMartComponent,
  ],
  templateUrl: './channel-thread.component.html',
  styleUrl: './channel-thread.component.scss'
})
export class ChannelThreadComponent {

  @Input() thread!: Thread;

  @ViewChild(EmojiMartComponent) emojiMart!: EmojiMartComponent;

  constructor() {
    setTimeout(() => {
      console.log('Thread:', this.thread);
      console.log('ThreadMessage:', this.thread.messages[0].content);
    }, 1000);

  }

  formattedDatestamp(): any {
    return this.thread.getFormattedDatestamp();
  }

  formattedTimeStamp(): any {
    return this.thread.getFormattedTimeStamp()
  }

  reactToThread(message: any, reactioen: string) {
    console.log('Threadmessage is:', message.thread);
    
  }
}

