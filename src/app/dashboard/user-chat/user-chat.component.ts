import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatList, MatListModule } from '@angular/material/list';
import { StorageService } from '../../services/storage.service';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.class';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuTrigger, MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { EmojiMartComponent } from '../emoji-mart/emoji-mart.component';
import { CommonModule } from '@angular/common';
import { AddImgToMessageComponent } from '../add-img-to-message/add-img-to-message.component';
import { EmojiCommunicationService } from '../../services/emoji-communication.service';
import { UserChat } from '../../models/user-chat';
import { Thread } from '../../models/thread.class';
import { ChannelThreadComponent } from '../channel-chat/channel-thread/channel-thread.component';
import { ChannelChatComponent } from '../channel-chat/channel-chat.component';
import { Subscription, firstValueFrom } from 'rxjs';
import { ThreadService } from '../../services/thread.service';
import { UserChatThreadComponent } from './user-chat-thread/user-chat-thread.component';


@Component({
  selector: 'app-user-chat',
  standalone: true,
  imports: [MatCard,
    MatCardHeader,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatList,
    MatListModule,
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    EmojiMartComponent,
    AddImgToMessageComponent,
    ChannelThreadComponent,
    ChannelChatComponent,
    UserChatThreadComponent
  ],
  templateUrl: './user-chat.component.html',
  styleUrl: './user-chat.component.scss',
})

export class UserChatComponent {

  @ViewChild("threadContainer") threadContainer!: ElementRef;
  @ViewChild("threadMessageBox") threadMessageBox!: ElementRef;
  @ViewChild("imgBox") imgBox!: ElementRef<any>;
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  @ViewChild(AddImgToMessageComponent) addImgToMessageComponent!: AddImgToMessageComponent;

  emojiSubscription: Subscription;

  constructor(
    public dataService: DataService,
    private route: ActivatedRoute,
    public storage: StorageService,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private emojiService: EmojiCommunicationService,
    public threadService: ThreadService,
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef
  ) {
    this.emojiSubscription = this.emojiService.emojiEvent$.subscribe(
      (event) => {
        if (event.sender === "UserChatComponent") {
          this.addEmoji(event.emoji);
        }
      })
  }

  users: any;
  userAuthId!: string;
  currentUser!: User;
  recipient!: User;
  currentUserChatId!: string;
  userChats!: any;
  currentUserChat!: UserChat | undefined;
  imgFile: File | undefined = undefined;
  currentUserChatThreads!: Thread[];
  emptyUserChat: boolean = false;

  shouldScrollToBottom: boolean = true;
  addListenerForScroll: boolean = true;

  //firstLoad: boolean = false;

  private userSub: Subscription = new Subscription();
  private userChatsSub: Subscription = new Subscription();
  private userChatSub: Subscription = new Subscription();
  private routeSub!: Subscription;


  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.currentUserChatId = params['id'];
      this.currentUserChat = undefined;
      this.reloadAll();
    });
  }


  ngAfterViewChecked() {
    if (this.shouldScrollToBottom && this.threadContainer) {
      this.scrollToBottom();
      if (this.addListenerForScroll) {
        this.threadContainer.nativeElement.addEventListener('scroll', this.handleScroll.bind(this));
        this.addListenerForScroll = false;
      }
    }
    this.cdRef.detectChanges();
  }

  scrollToBottom() {
    if (this.threadContainer) {
      try {
        this.threadContainer.nativeElement.scrollTop = this.threadContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error("Could not scroll to bottom:", err);
      }
    }
  }

  handleScroll() {
    const threshold = 1;
    const position = this.threadContainer.nativeElement.scrollTop + this.threadContainer.nativeElement.offsetHeight;
    const height = this.threadContainer.nativeElement.scrollHeight;
    this.shouldScrollToBottom = position > height - threshold;
  }


  async reloadAll() {
    this.dataSubscriptions();
    await this.loadUsers();
    await this.checkUserAuthId();
    this.getRecipient();
    this.getUserChat();
    this.getUserChatSub();
  }


  dataSubscriptions() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    this.userSub = this.dataService.getUsersList().subscribe((users: any) => {
      this.users = users;
    });


    if (this.userChatsSub) {
      this.userChatsSub.unsubscribe();
    }
    this.userChatsSub = this.dataService.getUserChatsList().subscribe((userChats: any) => {
      this.userChats = userChats;
  
      // if (this.firstLoad) {
      //   // this.getUserChat();
      // }
    })
  }


  async loadUsers() {
    this.users = await firstValueFrom(this.dataService.getUsersList());
    this.userChats = await firstValueFrom(this.dataService.getUserChatsList());
  }


  async checkUserAuthId() {
    try {
      await this.auth.getUserAuthId()
        .then(userId => {
          this.userAuthId = userId;
          this.findCurrentUser();
        })
        .catch(error => {
          console.error("Fehler beim Abrufen der Benutzer-ID:", error);
        });
    } catch {
      console.error('Keinen User gefunden')
    }
  }


  findCurrentUser() {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].authUserId === this.userAuthId) {
        this.currentUser = new User(this.users[i]);
        break;
      }
    }
  }


  getRecipient() {
    const recipientData = this.users.find((user: any) => user.id === this.currentUserChatId);

    if (recipientData) {
      this.recipient = new User(recipientData);
    } else {
      console.error(`Recipient with id ${this.currentUserChatId} not found`);
    }
  }


  getUserChat() {
    let userChatsOfCurrentUser: any[] = [];

    for (let i = 0; i < this.userChats.length; i++) {
      if (this.userChats[i].participants.includes(this.currentUser.id)) {
        userChatsOfCurrentUser.push(this.userChats[i]);
      }
    }

    if (this.currentUser.id == this.recipient.id) {
      for (let i = 0; i < userChatsOfCurrentUser.length; i++) {
        if (userChatsOfCurrentUser[i].participants[0] == userChatsOfCurrentUser[i].participants[1]) {
          this.currentUserChat = new UserChat(userChatsOfCurrentUser[i]);
          break;
        }
      }
    } else {
      for (let i = 0; i < userChatsOfCurrentUser.length; i++) {
        if (userChatsOfCurrentUser[i].participants.includes(this.recipient.id)) {
          this.currentUserChat = new UserChat(userChatsOfCurrentUser[i]);
          break;
        }
      }
    }

    if (this.currentUserChat) {
      this.getThreadsFromCurrentUserChat();
    } else {
      this.currentUserChatThreads = [];
      this.emptyUserChat = true;
    }
  }


  getThreadsFromCurrentUserChat() {
    this.currentUserChatThreads = [];

    if (this.currentUserChat) {
      if (this.currentUserChat.threads.length > 0) {
        for (let i = 0; i < this.currentUserChat.threads.length; i++) {
          let thread = this.currentUserChat.threads[i];
          this.currentUserChatThreads.push(thread);
        }
        this.emptyUserChat = false;
      } else {
        this.emptyUserChat = true;
      }
    }
  }


  getUserChatSub() {
    if (this.currentUserChat?.userChatId) {
      
      if (this.userChatSub) {
        this.userChatSub.unsubscribe();
      }
      this.userChatSub = this.dataService.getUserChat(this.currentUserChat.userChatId).subscribe((userChat: any) => {
        this.currentUserChat = userChat;
        this.currentUserChatThreads =  userChat.threads;
      })
    }
  }


  sortMessagesByTimestamp() {
    this.userChats.sort((a: any, b: any) => a.timestamp - b.timestamp);
  }


  channelThreadMessage: FormGroup = this.formBuilder.group({
    channelMessage: "",
  });


  addEmoji(emoji: string) {
    let textAreaElement = this.threadMessageBox.nativeElement;
    textAreaElement.value += emoji;
  }


  removeChatInput() {
    this.channelThreadMessage.reset();
    this.addImgToMessageComponent.removeImage();
  }


  async sendMessage() {
    if (this.threadMessageBox.nativeElement.value.length > 0) {
      this.emptyUserChat = false;

      let userChat = await this.currentUser.sendDirectMessage(
        this.recipient,
        this.threadMessageBox.nativeElement.value,
        this.currentUserChat,
        this.addImgToMessageComponent.imgFile,
      );

      if (!userChat.isNew) {
        await this.dataService.updateUserChat(userChat.currentUserChat);
      } else {
        await this.dataService.addUserChat(userChat.currentUserChat);
        await this.dataService.updateUserChatsOfUser(this.currentUser, this.recipient.id);
        await this.dataService.updateUserChatsOfUser(this.recipient, this.currentUser.id);
      }
    } else {
      console.log("Keine Nachricht eingegeben!");
    }
  }


  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.userChatsSub.unsubscribe();
    this.threadContainer.nativeElement.removeEventListener('scroll', this.handleScroll.bind(this));
    this.emojiSubscription.unsubscribe();
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

}

