import { Component, Input } from '@angular/core';
import { Thread } from '../../../models/thread.class';
import { EmojiMartComponent } from '../../emoji-mart/emoji-mart.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-full-thread-message',
  standalone: true,
  imports: [
    CommonModule,
    EmojiMartComponent,
  ],
  templateUrl: './full-thread-message.component.html',
  styleUrls: [
    './full-thread-message.component.scss',
    '../full-thread.component.scss'
  ]
})
export class FullThreadMessageComponent {

  @Input() thread!: Thread;
  threadMessages!: any;


  getFormattedDatestamp(timestamp: number): any {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Monate sind 0-basiert
    const day = date.getDate().toString().padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  getFormattedTimeStamp(timestamp: number) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const formattedTime = `${hours}:${minutes} Uhr`;

    return formattedTime;
  }

  getMessageContent(element: any) {
    console.log('Message Element:', element);
    
  }

}
