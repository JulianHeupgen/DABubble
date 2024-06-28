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
import { Observable, Subscription, firstValueFrom, of } from 'rxjs';
import { ThreadService } from '../../services/thread.service';
import { UserChatThreadComponent } from './user-chat-thread/user-chat-thread.component';


@Component({
  selector: 'app-user-chat',
  standalone: true,
  imports: [MatCard, MatCardHeader, MatCardContent, MatFormField, MatLabel, MatList, MatListModule, CommonModule, ReactiveFormsModule, MatDialogModule,
    MatMenuModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, EmojiMartComponent, AddImgToMessageComponent, ChannelThreadComponent,
    ChannelChatComponent, UserChatThreadComponent],
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
  groupedcurrentUserChatThreads: any = [];
  groupedcurrentUserChatThreads$!: Observable<{ [key: string]: { thread: Thread, index: number }[] }>;

  private userSub: Subscription = new Subscription();
  private userChatsSub: Subscription = new Subscription();
  private userChatSub: Subscription = new Subscription();
  private routeSub!: Subscription;

  /**
 * Initializes the component and subscribes to route parameters.
 * Sets the current user chat ID and reloads all necessary data.
 */
  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.currentUserChatId = params['id'];
      this.currentUserChat = undefined;
      this.reloadAll();
    });
  }


  /**
 * Checks if the view should scroll to the bottom and attaches a scroll event listener if necessary.
 * Detects changes using ChangeDetectorRef.
 */
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

  /**
 * Scrolls the thread container to the bottom.
 */
  scrollToBottom() {
    if (this.threadContainer) {
      try {
        this.threadContainer.nativeElement.scrollTop = this.threadContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error("Could not scroll to bottom:", err);
      }
    }
  }

  /**
 * Handles the scroll event and determines if the view should scroll to the bottom.
 */
  handleScroll() {
    const threshold = 1;
    const position = this.threadContainer.nativeElement.scrollTop + this.threadContainer.nativeElement.offsetHeight;
    const height = this.threadContainer.nativeElement.scrollHeight;
    this.shouldScrollToBottom = position > height - threshold;
  }

  /**
 * Reloads all necessary data by setting up subscriptions and loading users.
 * Checks user authentication and retrieves the recipient and user chat details.
 */
  async reloadAll() {
    this.dataSubscriptions();
    await this.loadUsers();
    await this.checkUserAuthId();
    this.getRecipient();
    this.getUserChat();
    this.getUserChatSub();
    this.groupedcurrentUserChatThreads$ = new Observable((observer) => {
      observer.next(this.groupedcurrentUserChatThreads);
      observer.complete();
    });
  }

  /**
 * Sets up subscriptions for user and user chat data.
 * Unsubscribes from existing subscriptions if they exist.
 */
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
    })
  }

  /**
 * Loads the list of users and user chats using the DataService.
 */
  async loadUsers() {
    this.users = await firstValueFrom(this.dataService.getUsersList());
    this.userChats = await firstValueFrom(this.dataService.getUserChatsList());
  }

  /**
 * Checks the user's authentication ID and sets the current user based on the retrieved ID.
 * Logs an error if the user ID cannot be retrieved.
 */
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

  /**
 * Finds and sets the current user based on the authenticated user ID.
 */
  findCurrentUser() {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].authUserId === this.userAuthId) {
        this.currentUser = new User(this.users[i]);
        break;
      }
    }
  }

  /**
 * Retrieves and sets the recipient user based on the current user chat ID.
 * Logs an error if the recipient cannot be found.
 */
  getRecipient() {
    const recipientData = this.users.find((user: any) => user.id === this.currentUserChatId);

    if (recipientData) {
      this.recipient = new User(recipientData);
    } else {
      console.error(`Recipient with id ${this.currentUserChatId} not found`);
    }
  }

  /**
 * Retrieves and sets the current user chat based on the current user and recipient.
 * In the if-statement, we need to check if the currentUser is chatting with themselves, 
 * meaning if currentUser.id is equal to recipient.id; in this case, currentUser.id 
 * appears twice within the participants. However, if the currentUser is chatting 
 * with someone else, we need to get the UserChat that contains the recipient.id.
 * After that we have to check if the user chat was found and process the threads accordingly.
 */
  getUserChat() {
    let userChatsOfCurrentUser: any[] = [];

    this.findUserChatsWithCurrentUser(userChatsOfCurrentUser);

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
    this.checkIfUserChatWasFound();
  }

  /**
 * Finds user chats that include the current user and adds them to the provided array.
 *
 * @param {any[]} userChatsOfCurrentUser - Array to store the user chats involving the current user.
 */
  findUserChatsWithCurrentUser(userChatsOfCurrentUser: any) {
    for (let i = 0; i < this.userChats.length; i++) {
      if (this.userChats[i].participants.includes(this.currentUser.id)) {
        userChatsOfCurrentUser.push(this.userChats[i]);
      }
    }
  }

  /**
 * Checks if the current user chat was found and processes its threads accordingly.
 * If no user chat was found, marks the chat as empty.
 */
  checkIfUserChatWasFound() {
    if (this.currentUserChat) {
      this.getThreadsFromCurrentUserChat();
    } else {
      this.currentUserChatThreads = [];
      this.groupedcurrentUserChatThreads = [];
      this.emptyUserChat = true;
    }
  }

  /**
 * Retrieves and processes the threads from the current user chat.
 * Groups the threads by date and updates the observable for grouped threads.
 */
  getThreadsFromCurrentUserChat() {
    this.currentUserChatThreads = [];
    this.groupedcurrentUserChatThreads = [];

    if (this.currentUserChat) {
      if (this.currentUserChat.threads.length > 0) {
        for (let i = 0; i < this.currentUserChat.threads.length; i++) {
          let thread = this.currentUserChat.threads[i];
          this.currentUserChatThreads.push(thread);
        }
        this.groupedcurrentUserChatThreads = this.dataService.groupThreadsByDate(this.currentUserChatThreads);
        this.groupedcurrentUserChatThreads$ = this.groupedcurrentUserChatThreads;
        this.emptyUserChat = false;
      } else {
        this.emptyUserChat = true;
      }
    }
  }

  /**
 * Subscribes to updates for the current user chat if its ID is available.
 * Groups the threads by date and updates the observable for grouped threads.
 */
  getUserChatSub() {
    if (this.currentUserChat?.userChatId) {
      if (this.userChatSub) {
        this.userChatSub.unsubscribe();
      }
      this.userChatSub = this.dataService.getUserChat(this.currentUserChat.userChatId).subscribe((userChat: any) => {
        this.groupedcurrentUserChatThreads$ = of(this.dataService.groupThreadsByDate(userChat));
      })
    }
  }

  /**
 * Sorts user chats by their timestamp in ascending order.
 */
  sortMessagesByTimestamp() {
    this.userChats.sort((a: any, b: any) => a.timestamp - b.timestamp);
  }

  /**
 * Form group for the channel thread message.
 */
  channelThreadMessage: FormGroup = this.formBuilder.group({
    channelMessage: "",
  });

  /**
 * Adds an emoji to the thread message input.
 *
 * @param {string} emoji - The emoji to be added.
 */
  addEmoji(emoji: string) {
    let textAreaElement = this.threadMessageBox.nativeElement;
    textAreaElement.value += emoji;
  }

  /**
   * Resets the chat input form and removes any attached images.
   */
  removeChatInput() {
    this.channelThreadMessage.reset();
    this.addImgToMessageComponent.removeImage();
  }

  /**
 * Sends a direct message to the recipient.
 * If the message box or img box is not empty, it sets the emptyUserChat flag to false and sends the message.
 * Updates the user chat if it exists, otherwise adds a new user chat and updates user chats of both the current user and the recipient.
 */
  async sendMessage() {
    if (this.threadMessageBox.nativeElement.value.length > 0 || this.addImgToMessageComponent.imgFile) {
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
        this.reloadAll();
      }
    }
  }


  /**
 * Cleans up by unsubscribing from all subscriptions and removing event listeners when the component is destroyed.
 */
  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.userChatsSub.unsubscribe();
    this.userChatSub.unsubscribe();
    this.threadContainer.nativeElement.removeEventListener('scroll', this.handleScroll.bind(this));
    this.emojiSubscription.unsubscribe();
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  /**
 * Custom trackBy function for tracking items by their timestamp.
 *
 * @param {any} item - The item to track.
 * @returns {number} The timestamp of the item.
 */
  trackByTimestamp(item: any): number {
    return item.timestamp;
  }
}
