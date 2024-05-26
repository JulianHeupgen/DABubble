import { Component, Input } from '@angular/core';
import { Thread } from '../../../models/thread.class';
import { EmojiMartComponent } from '../../emoji-mart/emoji-mart.component';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { MessageReactionComponent } from '../../channel-chat/message-reaction/message-reaction.component';
import { User } from '../../../models/user.class';
import { Firestore, Unsubscribe, doc, onSnapshot } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { ThreadService } from '../../../services/thread.service';

@Component({
  selector: 'app-full-thread-message',
  standalone: true,
  imports: [
    CommonModule,
    EmojiMartComponent,
    MessageReactionComponent,
  ],
  templateUrl: './full-thread-message.component.html',
  styleUrls: [
    './full-thread-message.component.scss',
    '../full-thread.component.scss',
    '../../channel-chat/channel-thread/channel-thread.component.scss'
  ]
})
export class FullThreadMessageComponent {

  @Input() thread!: Thread;
  @Input() currentUser!: User;
  threadMessages: any[] = [];

  private threadUnsubscribe!: Unsubscribe;

  constructor(
    private dataService: DataService,
    public threadService: ThreadService,
    private firebase: Firestore
  ) {  }

  ngOnInit() {
    this.loadThreadMessages();  
    this.listenForThreadChanges();
  }

  listenForThreadChanges() {
    this.threadUnsubscribe  = onSnapshot(doc(this.firebase, "threads", this.thread.threadId), (doc) => {
      this.loadThreadMessages();
      this.threadService.getReactionsForMessage(this.thread)
    });
  }

  loadThreadMessages() {
    this.threadMessages = [];
    this.thread.messages.forEach(message => {
      this.dataService.allUsers.forEach(user => {
        if (user.id == message.senderId) {
          message.sender = user;
        }
      })
      this.threadMessages.push(message);
    });
    console.log('threadMessages', this.threadMessages);
    console.log('thread', this.thread);
  }

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


  ngOnDestroy() {
      this.threadUnsubscribe();
  }
}
