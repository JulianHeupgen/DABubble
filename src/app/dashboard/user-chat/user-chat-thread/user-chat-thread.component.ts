import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Thread } from '../../../models/thread.class';
import { MessageReactionComponent } from '../../channel-chat/message-reaction/message-reaction.component';
import { User } from '../../../models/user.class';
import { UserChatComponent } from '../user-chat.component';
import { DataService } from '../../../services/data.service';
import { ThreadService } from '../../../services/thread.service';
import { EmojiMartComponent } from '../../emoji-mart/emoji-mart.component';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { deleteObject, getStorage, ref } from '@angular/fire/storage';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-user-chat-thread',
  standalone: true,
  imports: [EmojiMartComponent, MatMenuTrigger, MatMenu, MessageReactionComponent, CommonModule],
  templateUrl: './user-chat-thread.component.html',
  styleUrls: [
    './user-chat-thread.component.scss',
    '../../channel-chat/channel-thread/channel-thread.component.scss'
  ]
})
export class UserChatThreadComponent {

  @Input() thread!: Thread;
  @Input() userChatId!: string | undefined;
  @Input() userChatIndex!: number | undefined;

  @ViewChild(MessageReactionComponent) messageReaction!: MessageReactionComponent;
  @ViewChild("editMessageBox") editMessageBox!: ElementRef;
  threadOwner!: User
  currentUserIsMessageOwner: boolean = false;
  setReactionMenuHover: boolean = false;
  editMessage: boolean = false;
  imgFile: string = '';
  isImgFileEdited: boolean = false;
  sanitizedUrl: any;


  constructor(
    public userChat: UserChatComponent,
    public dataService: DataService,
    public threadService: ThreadService,
    private domSanitizer: DomSanitizer,
  ) {}


  /**
 * Initializes the component, determines if the current user is the message owner, and sets the thread owner.
 * If the current user is not the message owner, it calls `findThreadOwner` to set the thread owner.
 */
  ngOnInit() {
    let currentUserId = this.userChat.currentUser.id;
    let messageOwnerId = this.thread.messages[0].senderId;
    if (currentUserId == messageOwnerId) {
      this.currentUserIsMessageOwner = true;
      this.threadOwner = this.userChat.currentUser;
    } else {
      this.currentUserIsMessageOwner = false;
      this.findThreadOwner(messageOwnerId);
    }
    this.sanitizedUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.thread.messages[0].imgFileURL);

  }


  /**
 * Finds the thread owner based on the message owner's ID and sets `threadOwner`.
 *
 * @param {string} messageOwnerId - The ID of the message owner.
 */
  findThreadOwner(messageOwnerId: string) {
    this.dataService.allUsers.forEach(user => {
      if (user.id == messageOwnerId) {
        this.threadOwner = user;
      }
    })    
  }


  /**
 * Gets the formatted date stamp for the thread.
 *
 * @returns {any} - The formatted date stamp.
 */
  formattedDatestamp(): any {
    return this.thread.getFormattedDatestamp();
  }


  /**
 * Gets the formatted time stamp for the thread.
 *
 * @returns {any} - The formatted time stamp.
 */
  formattedTimeStamp(): any {
    return this.thread.getFormattedTimeStamp();
  }


  /**
 * Enables the edit mode for the thread message and disables the reaction menu hover.
 */
  editThreadMessage() {
    this.setReactionMenuHover = false;
    this.editMessage = true;
  }


  /**
 * Cancels the edit mode for the thread message and resets the image file edit flag.
 */
  cancelEditMessage() {
    this.editMessage = false;
    this.isImgFileEdited = false;
  }


  /**
 * Saves the edited message content and optionally deletes the associated image.
 * Updates the message content and clears the image URL if `isImgFileEdited` is true.
 * Copies the updated message to Firebase through `threadService`.
 * Disables editing mode for the message.
 *
 * @param {Thread} messageElement - The thread containing the message to be edited.
 * @param {string | undefined} userChatId - The ID of the user chat.
 * @param {number | undefined} index - The index of the message in the thread.
 */
  async saveEditMessage(messageElement: Thread, userChatId: string | undefined, index: number | undefined) {
    messageElement.messages[0].content = this.editMessageBox.nativeElement.value;
    if(this.isImgFileEdited) {
    const storage = getStorage();
    const desertRef = ref(storage, this.imgFile);
    deleteObject(desertRef).then(() => {
      messageElement.messages[0].imgFileURL = '';
    }).catch((error) => {
      console.log(error);
    });    
    }
    this.threadService.copyUserChatThreadForFirebase(messageElement, userChatId, index);
    this.editMessage = false;
  }

  
  /**
 * Deletes the image URL from the first message in the provided object.
 * Sets `imgFile` to the deleted image URL and marks `isImgFileEdited` as true.
 *
 * @param {any} obj - The object containing messages with an image URL.
 */
  deleteImg(obj: any) {
    this.imgFile = obj.messages[0].imgFileURL;  
    this.isImgFileEdited = true;
    obj.messages[0].imgFileURL = '';
  }

}
