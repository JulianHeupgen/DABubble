import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { ChannelThreadComponent } from '../channel-chat/channel-thread/channel-thread.component';
import { EditChannelComponent } from '../channel-chat/edit-channel/edit-channel.component';
import { ChannelParticipantsComponent } from '../channel-chat/channel-participants/channel-participants.component';
import { UserChat } from '../../models/user-chat';
import { UserChatMessageComponent } from './user-chat-message/user-chat-message.component';


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
    ChannelThreadComponent,
    ReactiveFormsModule,
    MatDialogModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    EmojiMartComponent,
    AddImgToMessageComponent,
    EditChannelComponent,
    ChannelParticipantsComponent,
    UserChatMessageComponent],
  templateUrl: './user-chat.component.html',
  styleUrl: './user-chat.component.scss'
})
export class UserChatComponent {

  @ViewChild("messageContainer") messageContainer!: ElementRef;
  @ViewChild("messageBox") messageBox!: ElementRef;
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
  currentUserChatId!: string;
  userChats!: any;
  currentUserChat!: UserChat;
  recipient!: User;
  imgFile: File | undefined = undefined;


  // setUserChatObject(id: string, data: any): any {
  //   return {
  //     userChatId: id,
  //     participants: data.participants,
  //     messages: data.messages
  //   }
  // }


  private userSub: Subscription = new Subscription();
  private userChatsSub: Subscription = new Subscription();

  //-------------------//

  pingUserControl = new FormControl("");
  filteredUsers!: Observable<any[]>;

  //------------------//

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

  // ngAfterViewChecked() {
  //   this.scrollToBottom();
  // }

  // scrollToBottom() {
  //   try {
  //     this.threadContainer.nativeElement.scrollTop =
  //       this.threadContainer.nativeElement.scrollHeight;
  //   } catch (err) {
  //     console.error("Could not scroll to bottom:", err);
  //   }
  // }

  
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
          // if (userId) {
          this.userAuthId = userId;
          this.findCurrentUser();
          // } else {
          //   console.log("Kein Benutzer angemeldet.");
          // }
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


  userChatMessage: FormGroup = this.formBuilder.group({
    message: "",
  });


  addEmoji(emoji: string) {
    let textAreaElement = this.messageBox.nativeElement;
    textAreaElement.value += emoji;
  }


  addUserToMessage(user: any) {
    if (this.messageBox && user) {
      this.messageBox.nativeElement.value += "@" + user.name + " ";
      this.pingUserControl.setValue("");
      this.menuTrigger.closeMenu();
    }
  }


  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.userChatsSub.unsubscribe();
  }


  removeChatInput() {
    this.userChatMessage.reset();
    this.addImgToMessageComponent.removeImage();
  }


  async sendMessage() {
    let userChat = await this.currentUser.sendDirectMessage(
      this.recipient,                                   
      this.userChatMessage.value.message,
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

