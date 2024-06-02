import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Message } from '../../../models/message.class';
import { getStorage, ref, deleteObject } from '@angular/fire/storage';
import { DataService } from '../../../services/data.service';
import { MessageReactionComponent } from '../../channel-chat/message-reaction/message-reaction.component';
import { UserChatComponent } from '../user-chat.component';
import { User } from '../../../models/user.class';
import { UserChatMessageReactionComponent } from '../user-chat-message-reaction/user-chat-message-reaction.component';
import { EmojiMartComponent } from '../../emoji-mart/emoji-mart.component';
import { CommonModule } from '@angular/common';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-user-chat-message',
  standalone: true,
  imports: [MessageReactionComponent, EmojiMartComponent, CommonModule, MatMenuTrigger, MatMenu, UserChatMessageReactionComponent],
  templateUrl: './user-chat-message.component.html',
  styleUrl: './user-chat-message.component.scss'
})
export class UserChatMessageComponent {

  @Input() message!: Message;

  @ViewChild(UserChatMessageReactionComponent) messageReaction!: UserChatMessageReactionComponent;
  @ViewChild("editMessageBox") editMessageBox!: ElementRef;
  messageOwner!: User
  currentUser!: User;
  isCurrentUser: boolean = false;
  setReactionMenuHover: boolean = false;
  editMessage: boolean = false;
  imgFile: string = '';
  isImgFileEdited: boolean = false;

  constructor(
    public userChat: UserChatComponent,
    public dataService: DataService,
    public messageService: MessageService,
  ) { }

  ngOnInit() {
    this.currentUser = this.userChat.currentUser;
    let currentUserId = this.currentUser.id;
    let messageOwnerId = this.message.senderId;
    if (currentUserId == messageOwnerId) {
      this.isCurrentUser = true;
    } else {
      this.isCurrentUser = false;
    }
    this.findMessageUser(messageOwnerId);
  }

  findMessageUser(messageOwnerId: string) {
    this.dataService.allUsers.forEach(user => {
      if (user.id == messageOwnerId) {
        this.messageOwner = user;
      }
    })
  }

  formattedDatestamp(): any {
    return this.message.getFormattedDatestamp();
  }

  formattedTimeStamp(): any {
    return this.message.getFormattedTimeStamp();
  }

  editThreadMessage() {
    this.setReactionMenuHover = false;
    this.editMessage = true;
  }

  cancelEditMessage() {
    this.editMessage = false;
    this.isImgFileEdited = false;
  }

  async saveEditMessage(messageElement: Message) {
    messageElement.content = this.editMessageBox.nativeElement.value
    if(this.isImgFileEdited) {
    const storage = getStorage();
    const desertRef = ref(storage, this.imgFile);
    deleteObject(desertRef).then(() => {
      messageElement.imgFileURL = '';
    }).catch((error) => {
      console.error(error);
    });    
    }
    this.messageService.copyMessageForFirebase(messageElement)
    this.editMessage = false;
  }

  deleteImg(obj: any) {
    this.imgFile = obj.imgFileURL;  
    this.isImgFileEdited = true;
    obj.imgFileURL = '';
  }

}


