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
  ) { }

  ngOnInit() {
    this.threadService.currentThread$.subscribe(event => {
      if (event.thread) {
        this.thread = event.thread;
        this.currentUser = event.currentUser;
      }
      this.loadThreadMessages();
      // this.listenForThreadChanges();
    });
    this.loadThreadMessages();
    this.listenForThreadChanges();
  }

  listenForThreadChanges() {
    this.threadUnsubscribe = onSnapshot(doc(this.firebase, "threads", this.thread.threadId), (doc) => {
      // console.log('DocData', doc.data());
      let data = doc.data();
      if (data) {
        let threadData = {
          threadId: data['threadId'],
          channelId: data['channelId'],
          messages: data['messages'],
          timestamp: data['timestamp'],
        };        
        this.thread = new Thread(threadData)        
        this.loadThreadMessages();
        this.threadService.getReactionsForMessage(this.thread);
        console.log('Listen to Firebase for Message of FullThread');
        
      }

    });
  }

  loadThreadMessages() {
    this.threadMessages = [];
    const userMap = new Map<string, User>();
    this.dataService.allUsers.forEach(user => {
      userMap.set(user.id, user);
    });
  
    this.thread.messages.forEach(message => {
      if (userMap.has(message.senderId)) {
        message.sender = userMap.get(message.senderId);        
      }
      this.threadMessages.push(message);
    });
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
    // console.log('Message Element:', element);

  }


  ngOnDestroy() {
    this.threadUnsubscribe();
  }
}
