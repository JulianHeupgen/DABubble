import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Thread } from '../../../models/thread.class';
import { EmojiMartComponent } from '../../emoji-mart/emoji-mart.component';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { MessageReactionComponent } from '../../channel-chat/message-reaction/message-reaction.component';
import { User } from '../../../models/user.class';
import { Firestore, Unsubscribe, doc, onSnapshot } from '@angular/fire/firestore';
import { ThreadService } from '../../../services/thread.service';
import { MatMenuModule } from '@angular/material/menu';
import { deleteObject, getStorage, ref } from '@angular/fire/storage';
import { Message } from '../../../models/message.class';

@Component({
  selector: 'app-full-thread-message',
  standalone: true,
  imports: [
    CommonModule,
    EmojiMartComponent,
    MessageReactionComponent,
    MatMenuModule,
  ],
  templateUrl: './full-thread-message.component.html',
  styleUrls: [
    './full-thread-message.component.scss',
    '../full-thread.component.scss',
    '../../channel-chat/channel-thread/channel-thread.component.scss',
    '../../channel-chat/channel-chat.component.scss',
  ]
})
export class FullThreadMessageComponent {

  @Input() thread!: Thread;
  @Input() currentUser!: User;
  @ViewChild("editMessageReply") editMessageReply!: ElementRef;

  threadMessages: any[] = [];
  imgFile: string = '';
  groupedMessages: { [key: string]: any[] } = {};
  
  isImgFileEdited: boolean = false;

  private threadUnsubscribe!: Unsubscribe;

  constructor(
    public dataService: DataService,
    public threadService: ThreadService,
    private firebase: Firestore
  ) { }

  ngOnInit() {
    this.threadService.currentThread$.subscribe(event => {
      if (event.thread) {
        this.thread = event.thread;
        this.currentUser = event.currentUser;
      }
      this.listenForThreadChanges();
    });
      this.listenForThreadChanges();
  }

  listenForThreadChanges() {
    this.groupedMessages = {};
    this.threadUnsubscribe = onSnapshot(doc(this.firebase, "threads", this.thread.threadId), (doc) => {
      let data = doc.data();
      if (data) {
        let threadData = {
          threadId: this.thread.threadId,
          channelId: data['channelId'],
          messages: data['messages'],
          timestamp: data['timestamp'],
        };        
        this.thread = new Thread(threadData);
        this.threadService.getThreadChanges(this.thread)        
        this.loadThreadMessages();
        this.threadService.getReactionsForMessage(this.thread);        
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
    this.threadMessages.splice(0,1);
    this.groupedMessages = this.groupThreadsByDate();
  }

  groupThreadsByDate(): { [key: string]: Thread[] } {
    return this.threadMessages.reduce((groups, thread) => {
      const date = new Date(thread.timestamp).toISOString().split('T')[0]; // Format: YYYY-MM-DD
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(thread);
      return groups;
    }, {} as { [key: string]: Thread[] });
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

  editThreadMessageReply(messageObj: Message) {    
    messageObj.hoverReactionbar = true;
    messageObj.editMode = true;
  }

  deleteThreadMessageReply(threadObj: any, messageObj: Message) {
    messageObj.hoverReactionbar = true;
    const index = threadObj.messages.findIndex((msg: Message) => msg.timestamp === messageObj.timestamp);
    if (index !== -1) {
      threadObj.messages.splice(index, 1);
    }
    this.threadService.copyThreadForFirebase(threadObj)
  }

  cancelEditMessage(messageObj: Message) {
    messageObj.editMode = false;
    this.isImgFileEdited = false;
  }

  async saveEditMessage(threadObj: Thread, messageObj: Message) {
    messageObj.content = this.editMessageReply.nativeElement.value;
    
    if(this.isImgFileEdited) {
    const storage = getStorage();
    const desertRef = ref(storage, this.imgFile);
    deleteObject(desertRef).then(() => {
      messageObj.imgFileURL = '';
    }).catch((error) => { });    
    }
    this.threadService.copyThreadForFirebase(threadObj)
    messageObj.editMode = false;
  }

  deleteImg(obj: any) {
    this.imgFile = obj.imgFileURL;  
    this.isImgFileEdited = true;
    obj.imgFileURL = '';
  }

  setHoverReactionbar(messageObj: Message) {
    messageObj.hoverReactionbar = true;
  }

  ngOnDestroy() {
    this.threadUnsubscribe();
  }
}
