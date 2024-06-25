import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Thread } from '../../../models/thread.class';
import { CommonModule } from '@angular/common';
import { EmojiMartComponent } from '../../emoji-mart/emoji-mart.component';
import { ChannelChatComponent } from '../channel-chat.component';
import { MessageReactionComponent } from '../message-reaction/message-reaction.component';
import { DashboardComponent } from '../../dashboard.component';
import { DataService } from '../../../services/data.service';
import { ThreadService } from '../../../services/thread.service';
import { MatMenuModule } from '@angular/material/menu';
import { User } from '../../../models/user.class';
import { deleteObject, getStorage, ref } from '@angular/fire/storage';
import { ViewProfileComponent } from '../../../dialog/view-profile/view-profile.component';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-channel-thread',
  standalone: true,
  imports: [
    CommonModule,
    MessageReactionComponent,
    EmojiMartComponent,
    MatMenuModule,
  ],
  templateUrl: './channel-thread.component.html',
  styleUrl: './channel-thread.component.scss',
})

export class ChannelThreadComponent {

  @Input() thread!: Thread;

  @ViewChild(MessageReactionComponent) messageReaction!: MessageReactionComponent;
  @ViewChild("editMessageBox") editMessageBox!: ElementRef;
  threadUser!: User
  isCurrentUser: boolean = false;
  editMessage: boolean = false;
  imgFile: string = '';
  isImgFileEdited: boolean = false;
  sanitizedUrl: any;

  /**
   * creates an instance of ChannelThreadComponent
   * @param channelChat - the ChannelChatComponent(parant)
   * @param dataService - the data service
   * @param threadService - the thread service
   * @param dialog - for dialogs of material design
   */
  constructor(
    public channelChat: ChannelChatComponent,
    public dataService: DataService,
    public threadService: ThreadService,
    public dialog: MatDialog,
    private domSanitizer: DomSanitizer
  ) { }

  /**
   * checks if message author is the current user
   */
  ngOnInit() {
    let currentUserId = this.channelChat.currentUser.id;
    let messageOwnerId = this.thread.messages[0].senderId
    if (currentUserId == messageOwnerId) {
      this.isCurrentUser = true;
    } else {
      this.isCurrentUser = false;
    }
    this.findThreadUser(messageOwnerId);
    this.sanitizedUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.thread.messages[0].imgFileURL);
  }

  /**
   * receive user of thread author
   * @param {string} messageOwnerId 
   */
  findThreadUser(messageOwnerId: string) {
    this.dataService.allUsers.forEach(user => {
      if (user.id == messageOwnerId) {
        this.threadUser = user;
      }
    })
  }

  /**
   * translate unix timstamp to date
   * @returns - date
   */
  formattedDatestamp(): any {
    return this.thread.getFormattedDatestamp();
  }

  /**
   * translate unix timstamp to time
   * @returns - time
   */
  formattedTimeStamp(): any {
    return this.thread.getFormattedTimeStamp();
  }

  /**
   * send data of thread to full thread component
   * @param {Thread} thread 
   */
  async openThread(thread: Thread) {
    try {
      await this.threadService.openFullThread(true);
      setTimeout(() => {
        this.threadService.changeThread(thread, this.threadUser, this.channelChat.currentChannel, this.channelChat.currentUser);
      }, 0);
    } catch (error) {
      console.error('Error opening thread:', error);
    }
  }

  /**
   * set message edit true
   */
  editThreadMessage() {
    this.editMessage = true;
  }

  /**
   * set message edit false
   * set img edit false
   */
  cancelEditMessage() {
    this.editMessage = false;
    this.isImgFileEdited = false;
  }

  /**
   * show profile of user in thread
   * @param participant 
   */
  showProfile(participant: any) {
    this.dialog.open(ViewProfileComponent, {
      data: participant
   });
 }

 /**
  * save edit message
  * if img deleted, delete img from firebase storage
  * @param {Thread} messageElement 
  */
  async saveEditMessage(messageElement: Thread) {
    messageElement.messages[0].content = this.editMessageBox.nativeElement.value
    if(this.isImgFileEdited) {
    const storage = getStorage();
    const desertRef = ref(storage, this.imgFile);
    deleteObject(desertRef).then(() => {
      messageElement.messages[0].imgFileURL = '';
    }).catch((error) => {
      // Uh-oh, an error occurred!
    });
    }
    this.threadService.copyThreadForFirebase(messageElement)
    this.editMessage = false;
  }

  /**
   * delete img of message
   * set img edit boolean true
   * @param {Thread} obj 
   */
  deleteImg(obj: Thread) {
    this.imgFile = obj.messages[0].imgFileURL;
    this.isImgFileEdited = true;
    obj.messages[0].imgFileURL = '';
  }
}
