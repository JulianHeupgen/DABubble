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

@Component({
  selector: 'app-user-chat-thread',
  standalone: true,
  imports: [EmojiMartComponent, MatMenuTrigger, MatMenu, MessageReactionComponent, CommonModule],
  templateUrl: './user-chat-thread.component.html',
  styleUrl: './user-chat-thread.component.scss'
})
export class UserChatThreadComponent {

  @Input() thread!: Thread;
  @Input() userChatId!: string | undefined;
  @Input() index!: number | undefined;

  @ViewChild(MessageReactionComponent) messageReaction!: MessageReactionComponent;
  @ViewChild("editMessageBox") editMessageBox!: ElementRef;
  threadOwner!: User
  currentUserIsMessageOwner: boolean = false;
  setReactionMenuHover: boolean = false;
  editMessage: boolean = false;
  imgFile: string = '';
  isImgFileEdited: boolean = false;


  constructor(
    public userChat: UserChatComponent,
    public dataService: DataService,
    public threadService: ThreadService
  ) {}


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
  }

  findThreadOwner(messageOwnerId: string) {
    this.dataService.allUsers.forEach(user => {
      if (user.id == messageOwnerId) {
        this.threadOwner = user;
      }
    })
  }

  formattedDatestamp(): any {
    return this.thread.getFormattedDatestamp();
  }

  formattedTimeStamp(): any {
    return this.thread.getFormattedTimeStamp();
  }

  editThreadMessage() {
    this.setReactionMenuHover = false;
    this.editMessage = true;
  }

  cancelEditMessage() {
    this.editMessage = false;
    this.isImgFileEdited = false;
  }

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

  deleteImg(obj: any) {
    this.imgFile = obj.messages[0].imgFileURL;  
    this.isImgFileEdited = true;
    obj.messages[0].imgFileURL = '';
  }

}
