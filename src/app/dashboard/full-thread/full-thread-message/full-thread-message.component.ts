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
import { DomSanitizer } from '@angular/platform-browser';

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
    private firebase: Firestore,
    private domSanitizer: DomSanitizer,
  ) { }


  /**
 * Initializes the component.
 * Subscribes to `currentThread$` from `threadService` to listen for updates related to the current thread.
 * Calls `listenForThreadChanges()` to start listening for changes in the thread.
 */
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


  /**
 * Listens for changes in the current thread.
 * Updates `thread` and retrieves changes from Firestore.
 * Loads thread messages and reactions for the thread.
 */
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


  /**
 * Loads messages from the current thread.
 * Maps sender IDs to user objects and populates `threadMessages`.
 * Groups messages by date using `groupThreadsByDate()`.
 */
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


  /**
 * Groups thread messages by date.
 * Uses the message timestamp to group messages into date categories.
 *
 * @returns {Object} - An object where keys are date strings (YYYY-MM-DD) and values are arrays of `Thread` objects.
 */
  groupThreadsByDate(): { [key: string]: Thread[] } {
    return this.threadMessages.reduce((groups, thread) => {
      const date = new Date(thread.timestamp).toISOString().split('T')[0]; 
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(thread);
      return groups;
    }, {} as { [key: string]: Thread[] });
  }


  /**
 * Formats a timestamp into a date string (YYYY-MM-DD).
 *
 * @param {number} timestamp - The timestamp to format.
 * @returns {string} - The formatted date string (YYYY-MM-DD).
 */
  getFormattedDatestamp(timestamp: number): any {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const day = date.getDate().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }


  /**
 * Formats a timestamp into a time string (HH:mm Uhr).
 *
 * @param {number} timestamp - The timestamp to format.
 * @returns {string} - The formatted time string (HH:mm Uhr).
 */
  getFormattedTimeStamp(timestamp: number) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes} Uhr`;

    return formattedTime;
  }


  /**
 * Prepares a message object for editing.
 *
 * @param {Message} messageObj - The message object to edit.
 */
  editThreadMessageReply(messageObj: Message) {    
    messageObj.hoverReactionbar = true;
    messageObj.editMode = true;
  }


  /**
 * Deletes a message from the thread.
 * Removes the message from `threadObj.messages` and updates Firebase.
 *
 * @param {any} threadObj - The thread object containing the messages.
 * @param {Message} messageObj - The message object to delete.
 */
  deleteThreadMessageReply(threadObj: any, messageObj: Message) {
    messageObj.hoverReactionbar = true;
    const index = threadObj.messages.findIndex((msg: Message) => msg.timestamp === messageObj.timestamp);
    if (index !== -1) {
      threadObj.messages.splice(index, 1);
    }
    this.threadService.copyThreadForFirebase(threadObj)
  }


  /**
 * Cancels the editing of a message.
 *
 * @param {Message} messageObj - The message object to cancel editing for.
 */
  cancelEditMessage(messageObj: Message) {
    messageObj.editMode = false;
    this.isImgFileEdited = false;
  }


  /**
 * Saves the edited content of a message.
 * Updates `messageObj.content` with the new value and saves changes to Firebase.
 *
 * @param {Thread} threadObj - The thread object containing the message.
 * @param {Message} messageObj - The message object to save changes for.
 */
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


  /**
 * Deletes an image from the message.
 * Sets `isImgFileEdited` to true and clears `obj.imgFileURL`.
 *
 * @param {any} obj - The object containing the image file URL to delete.
 */
  deleteImg(obj: any) {
    this.imgFile = obj.imgFileURL;  
    this.isImgFileEdited = true;
    obj.imgFileURL = '';
  }


  /**
 * Sets the hover state for the reaction bar of a message.
 *
 * @param {Message} messageObj - The message object to set hover state for.
 */
  setHoverReactionbar(messageObj: Message) {
    messageObj.hoverReactionbar = true;
  }


  /**
 * Cleans up resources when the component is destroyed.
 * Unsubscribes from `threadUnsubscribe` to stop listening for thread changes.
 */
  ngOnDestroy() {
    this.threadUnsubscribe();
  }

  getImgUrlforPDF(messageContent: string) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(messageContent);
  }
}

