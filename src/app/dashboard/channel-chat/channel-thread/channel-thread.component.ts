import { Component, Input } from '@angular/core';
import { Thread } from '../../../models/thread.class';

@Component({
  selector: 'app-channel-thread',
  standalone: true,
  imports: [],
  templateUrl: './channel-thread.component.html',
  styleUrl: './channel-thread.component.scss'
})
export class ChannelThreadComponent {

  @Input() thread!: Thread;

  constructor() {

    setTimeout(() => {
      console.log('Thread:', this.thread);
      console.log('ThreadMessage:', this.thread.messages[0].content);
    }, 1000);
    
  }

  formattedTimestamp(): any {
    return this.thread.getFormattedTimestamp();
  }
}

