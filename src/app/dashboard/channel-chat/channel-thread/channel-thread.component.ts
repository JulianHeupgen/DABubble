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
      this.getMessageFromThreads()
    }, 500);
  }

  getMessageFromThreads() {
    let message = this.thread.messages[0];
    console.log('Message is:', message);

  }

  formattedTimestamp(): any {
    return this.thread.getFormattedTimestamp();
  }

}

