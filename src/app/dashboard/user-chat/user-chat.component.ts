import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatList, MatListModule } from '@angular/material/list';
import { StorageService } from '../../services/storage.service';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.class';
import { Observable, Subscription, firstValueFrom, map, startWith } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
    ChannelThreadComponent
  ],
  templateUrl: './user-chat.component.html',
  styleUrl: './user-chat.component.scss'
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
    public dialog: MatDialog
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
  currentUserChat!: UserChat;
  imgFile: File | undefined = undefined;
  currentUserChatThreads!: Thread[];

  private userSub: Subscription = new Subscription();
  private userChatsSub: Subscription = new Subscription();


  pingUserControl = new FormControl("");
  filteredUsers!: Observable<any[]>;


  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.currentUserChatId = params['id'];
      this.reloadAll();
    });
  }


  async reloadAll() {
    this.dataSubscriptions();
    await this.loadUsers();
    await this.checkUserAuthId();
    this.getRecipient();
    this.getUserChat();
    this.filteredUsers = this.pingUserControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterUsers(value || ''))
    );
  }



  dataSubscriptions() {
    if(this.userSub) {
      this.userSub.unsubscribe();
    }
    this.userSub = this.dataService.getUsersList().subscribe((users: any) => {
      this.users = users;
    });


    if(this.userChatsSub) {
      this.userChatsSub.unsubscribe();
    }
    this.userChatsSub = this.dataService.getUserChatsList().subscribe((userChats: any) => {
      this.userChats = userChats;
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


  async findCurrentUser() {
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

    for (let i = 0; i < userChatsOfCurrentUser.length; i++) {
      if (userChatsOfCurrentUser[i].participants.includes(this.recipient.id)) {
        this.currentUserChat = new UserChat(userChatsOfCurrentUser[i]);
        break;
      }
    }

    this.getThreadsFromCurrentUserChat();
  }


  getThreadsFromCurrentUserChat() {
    this.currentUserChatThreads = [];

     if(this.currentUserChat) {
       for (let i = 0; i < this.currentUserChat.threads.length; i++) {
         let thread = this.currentUserChat.threads[i];
         thread = Thread.fromJSON(thread);
         this.currentUserChatThreads.push(thread);
    }}
   this.currentUserChat.threads = this.currentUserChatThreads;
  }


private _filterUsers(value: string): any[] {
  const filterValue = value.toLowerCase();
  return this.users.filter((user: any) =>
     user.name.toLowerCase().startsWith(filterValue)
)
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


  addUserToMessage(user: any) {
    if (this.threadMessageBox && user) {
      this.threadMessageBox.nativeElement.value += "@" + user.name + " ";
      this.pingUserControl.setValue("");
      this.menuTrigger.closeMenu();
    }
  }


  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.userChatsSub.unsubscribe();
  }


  removeChatInput() {
    this.channelThreadMessage.reset();
    this.addImgToMessageComponent.removeImage();
  }


  async sendMessage() {
    let userChat = await this.currentUser.sendDirectMessage(
      this.recipient,                                   
      this.channelThreadMessage.value.message,
      this.currentUserChat,
      this.addImgToMessageComponent.imgFile,
    );

    if (userChat.isNew) {
      await this.dataService.addUserChat(userChat.currentUserChat);
      await this.dataService.updateUser(this.currentUser);
      await this.dataService.updateUser(this.recipient);
    } else {
      await this.dataService.updateUserChat(userChat.currentUserChat);
    }

  }

}

