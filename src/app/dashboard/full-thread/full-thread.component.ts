import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { EmojiMartComponent } from '../emoji-mart/emoji-mart.component';
import { Thread } from '../../models/thread.class';
import { MessageReactionComponent } from '../channel-chat/message-reaction/message-reaction.component';
import { User } from '../../models/user.class';
import { DataService } from '../../services/data.service';
import { ThreadService } from '../../services/thread.service';
import { FullThreadMessageComponent } from './full-thread-message/full-thread-message.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, Subscription, map, startWith } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { AddImgToMessageComponent } from '../add-img-to-message/add-img-to-message.component';
import { EmojiCommunicationService } from '../../services/emoji-communication.service';
import { Channel } from '../../models/channel.class';
import { deleteObject, getStorage, ref } from '@angular/fire/storage';
import { Message } from '../../models/message.class';

@Component({
  selector: 'app-full-thread',
  standalone: true,
  imports: [
    CommonModule,
    EmojiMartComponent,
    MessageReactionComponent,
    FullThreadMessageComponent,
    ReactiveFormsModule,
    MatMenuModule,
    MatFormField,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    AddImgToMessageComponent,
  ],
  templateUrl: './full-thread.component.html',
  styleUrls: [
    './full-thread.component.scss',
    '../channel-chat/channel-chat.component.scss',
    '../channel-chat/channel-thread/channel-thread.component.scss',
  ]
})
export class FullThreadComponent {

  isCurrentUser: boolean = false;

  thread: Thread | null = null;
  threadOwner: User | null = null;
  currentUser!: User;
  currentChannel!: Channel;
  users: any[] = [];
  emojiSubscription: Subscription;
  imgFile: File | undefined = undefined;

  imgFileLink: string = '';
  setReactionMenuHover: boolean = false;
  isImgFileEdited: boolean = false;

  pingUserControlFullThread = new FormControl("");
  filteredUsers!: Observable<any[]>;

  @ViewChild("imgBoxFullThread") imgBoxFullThread!: ElementRef<any>;
  @ViewChild("fullThreadMessageBox") fullThreadMessageBox!: ElementRef;
  @ViewChild("editFullThreadMessageBox") editFullThreadMessageBox!: ElementRef;
  @ViewChild(AddImgToMessageComponent) addImgToMessageComponent!: AddImgToMessageComponent;
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  
  constructor(
    public threadService: ThreadService,
    private formBuilder: FormBuilder,
    public dataService: DataService,
    private emojiService: EmojiCommunicationService,
  ) {
    this.emojiSubscription = this.emojiService.emojiEvent$.subscribe(
      (event) => {
        if (event.sender === "FullThreadComponent") {
          this.addEmoji(event.emoji);
        }
      })
      this.threadService.currentMessages$.subscribe(event => {
        if (event.update === 'updateReaction') {
          if (event.thread) {
            this.thread = event.thread;
          }
        }
      });
  }

  fullThreadMessage: FormGroup = this.formBuilder.group({
    threadMessage: "",
  });

  ngOnInit(): void {
    this.threadService.currentThread$.subscribe(event => {
      if (event.thread) {
        this.sortNewDataFromThreadService(event)
        this.checkCurrentUser();
      }
      this.getUsersOfThread();
      this.filteredUsers = this.pingUserControlFullThread.valueChanges.pipe(
        startWith(''),
        map(value => this._filterUsers(value || ''))
      );
    });
    
  }

  sortNewDataFromThreadService(event: any) {
    this.thread = event.thread;
    this.threadOwner = event.threadOwner;
    this.currentUser = event.currentUser;
    this.currentChannel = event.currentChannel;
  }

  checkCurrentUser() {
    if (this.thread) {      
      let messageOwnerId = this.thread?.messages[0].senderId;
      
      if (messageOwnerId == this.currentUser.id) {
        this.isCurrentUser = true;
    } else {
        this.isCurrentUser = false;
    }
    }
  }

  getUsersOfThread() {
    this.users = []
    const userMap = new Map<string, User>();
    this.thread?.messages.forEach(message => {
      this.dataService.allUsers.forEach(user => {
        if (user.id == message.senderId) {
          userMap.set(user.id, user);
          // this.users.push(user);
        }
      })
    })
    this.users = Array.from(userMap.values());
    console.log('this.users',this.users);
    console.log('Thread Messages is:', this.thread?.messages[0]);
    
  }

  closeThread() {
    // this.threadService.openThread = false;
    this.threadService.openFullThread(false);
  }

  private _filterUsers(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.users.filter((user: any) =>
      user.name.toLowerCase().startsWith(filterValue)
    );
  }

  addUserToMessage(user: User) {
    if (this.fullThreadMessage && user) {
      this.fullThreadMessageBox.nativeElement.value += "@" + user.name + " ";
      this.pingUserControlFullThread.setValue("");
      this.menuTrigger.closeMenu();
    }
    
  }

  async sendMessage() {
    if(this.thread) {
      await this.currentUser.sendChannelMessage(
        this.currentChannel,
        this.fullThreadMessage.value.threadMessage,
        this.addImgToMessageComponent.imgFile,
        this.thread
      );
      let newThread = this.jsonToString(new Thread(this.thread));

        this.dataService.updateThread(newThread);
      
    }
  }

  jsonToString(thread: Thread) {
    let stringedMessages: string[] = []
    thread.messages.forEach(message => {
      stringedMessages.push(JSON.stringify(message))
    })
    thread.messages = stringedMessages;
    return thread
  }

  addEmoji(emoji: string) {
    let textAreaElement = this.fullThreadMessageBox.nativeElement;
    textAreaElement.value += emoji;
  }

  removeChatInput() {
    this.fullThreadMessage.reset();
    this.addImgToMessageComponent.removeImage();
  }

  editThreadMessage(messageObj:Message) {
    this.setReactionMenuHover = false;
    messageObj.editMode = true;
  }

  cancelEditMessage(messageObj:Message) {
    messageObj.editMode = false;
    this.isImgFileEdited = false;
  }

  deleteImg(obj: any) {
    this.imgFileLink = obj.messages[0].imgFileURL;  
    this.isImgFileEdited = true;
    obj.messages[0].imgFileURL = '';
  }

  async saveEditMessage(messageElement: Thread) {
    messageElement.messages[0].content = this.editFullThreadMessageBox.nativeElement.value
    if(this.isImgFileEdited) { 
    this.threadService.deletFileOfMessage(this.imgFileLink)
    messageElement.messages[0].imgFileURL = '';
    }
    this.threadService.copyThreadForFirebase(messageElement)
    messageElement.messages[0].editMode = false;
  }
}
