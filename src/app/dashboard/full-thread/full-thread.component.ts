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
import { MatMenuModule } from '@angular/material/menu';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, Subscription, map, startWith } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { AddImgToMessageComponent } from '../add-img-to-message/add-img-to-message.component';
import { EmojiCommunicationService } from '../../services/emoji-communication.service';
import { ChannelChatComponent } from '../channel-chat/channel-chat.component';
import { Channel } from '../../models/channel.class';
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
    '../channel-chat/channel-chat.component.scss'
  ]
})
export class FullThreadComponent {

  // openThread: boolean = false;
  thread: Thread | null = null;
  threadOwnder: User | null = null;
  currentUser!: User;
  currentChannel!: Channel;
  users: any[] = [];
  emojiSubscription: Subscription;
  imgFile: File | undefined = undefined;


  pingUserControlFullThread = new FormControl("");
  filteredUsers!: Observable<any[]>;

  @ViewChild("imgBoxFullThread") imgBoxFullThread!: ElementRef<any>;
  @ViewChild("fullThreadMessageBox") fullThreadMessageBox!: ElementRef;
  @ViewChild(AddImgToMessageComponent) addImgToMessageComponent!: AddImgToMessageComponent;
  
  constructor(
    public threadService: ThreadService,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private emojiService: EmojiCommunicationService,
  ) {
    this.emojiSubscription = this.emojiService.emojiEvent$.subscribe(
      (event) => {
        if (event.sender === "FullThreadComponent") {
          this.addEmoji(event.emoji);
        }
      })
  }

  fullThreadMessage: FormGroup = this.formBuilder.group({
    threadMessage: "",
  });

  ngOnInit(): void {
    this.threadService.currentThread$.subscribe(event => {
    if (event.thread) {
        this.thread = event.thread;
        this.threadOwnder = event.threadOwner;
        this.currentUser = event.currentUser;
        this.currentChannel = event.currentChannel;
        this.threadService.openThread = true;
        console.log('FullThread:', this.thread)
      }
    });
    this.filteredUsers = this.pingUserControlFullThread.valueChanges.pipe(
      startWith(''),
      map(value => this._filterUsers(value || ''))
    );
  }

  getUsersOfThread() {
    this.users = []
    this.thread?.messages.forEach(message => {
      this.dataService.allUsers.forEach(user => {
        if (user.id == message.senderId) {
          this.users.push(user);
        }
      })
    })
  }

  closeThread() {
    this.threadService.openThread = false;
  }

  private _filterUsers(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.users.filter((user: any) =>
      user.name.toLowerCase().startsWith(filterValue)
    );
  }

  addUserToMessage(user: User) {

  }

  async sendMessage() {
    if(this.thread) {
      await this.currentUser.sendChannelMessage(
        this.currentChannel,
        this.fullThreadMessage.value.threadMessage,
        this.addImgToMessageComponent.imgFile,
        this.thread
      );
      let newThread = new Thread(this.thread);
        // this.thread?.messages.push(newThreadMessage);
        // console.log('Thread copy', newThreadMessageToString);
        console.log('Thread origin', newThread);
        this.dataService.updateThread(newThread);
      
    }
  }

  addEmoji(emoji: string) {
    let textAreaElement = this.fullThreadMessageBox.nativeElement;
    textAreaElement.value += emoji;
  }

  removeChatInput() {
    this.fullThreadMessage.reset();
    this.addImgToMessageComponent.removeImage();
  }
}
