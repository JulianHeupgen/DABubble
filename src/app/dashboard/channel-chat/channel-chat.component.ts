import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatList, MatListModule } from '@angular/material/list';
import { Channel } from '../../models/channel.class';
import { StorageService } from '../../services/storage.service';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { ChannelThreadComponent } from './channel-thread/channel-thread.component';
import { User } from '../../models/user.class';
import { Thread } from '../../models/thread.class';
import { Observable, Subscription, firstValueFrom, map, startWith } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuTrigger, MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { EmojiMartComponent } from '../emoji-mart/emoji-mart.component';
import { CommonModule } from '@angular/common';
import { AddImgToMessageComponent } from '../add-img-to-message/add-img-to-message.component';
import { EditChannelComponent } from './edit-channel/edit-channel.component';
import { EmojiCommunicationService } from '../../services/emoji-communication.service';
import { ChannelParticipantsComponent } from './channel-participants/channel-participants.component';
import { AddUsersComponent } from '../../dialog/add-users/add-users.component';

@Component({
  selector: "app-channel-chat",
  standalone: true,
  imports: [
    MatCard,
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
    ChannelParticipantsComponent
  ],
  templateUrl: "./channel-chat.component.html",
  styleUrl: "./channel-chat.component.scss"
})

export class ChannelChatComponent {

  @ViewChild("threadContainer") threadContainer!: ElementRef;
  @ViewChild("threadMessageBox") threadMessageBox!: ElementRef;
  @ViewChild("imgBox") imgBox!: ElementRef<any>;
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  @ViewChild(AddImgToMessageComponent) addImgToMessageComponent!: AddImgToMessageComponent;

  emojiSubscription: Subscription;
  groupedChannelThreads$!: Observable<{ [key: string]: { thread: Thread, index: number }[] }>;

  constructor(
    public dataService: DataService,
    private route: ActivatedRoute,
    public storage: StorageService,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private emojiService: EmojiCommunicationService,
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
  ) {
    this.emojiSubscription = this.emojiService.emojiEvent$.subscribe(
      (event) => {
        if (event.sender === "ChannelChatComponent") {
          this.addEmoji(event.emoji);
        }
      })
  }

  userAuthId!: string;
  users: any;
  currentUser!: User;
  channels: any;
  channelId: string = "";
  currentChannel!: Channel;
  participantsImages: any[] = [];
  threads: any;
  channelThreads!: Thread[];
  imgFile: File | undefined = undefined;


  shouldScrollToBottom: boolean = true;
  addListenerForScroll: boolean = true;

  private userSub: Subscription = new Subscription();
  private channelSub: Subscription = new Subscription();
  private routeSub!: Subscription;
  private channelParticipantsSub!: Subscription;
  //-------------------//

  pingUserControl = new FormControl("");
  filteredUsers!: Observable<any[]>;

  //------------------//

  channelThreadMessage: FormGroup = this.formBuilder.group({
    channelMessage: ['', Validators.required],
  });

  //------------------//

  /**
   * Initializes the component by subscribing to route params,
   * loading necessary data, and setting up observables.
   */
  async ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.channelId = params['id'];
      this.dataService.currentChannelId = this.channelId;
      this.dataService.getThreadsList(); 
      this.reloadAll();
      this.groupedChannelThreads$ = this.dataService.groupedChannelThreads.asObservable();
    });
  }


  /**
   * Reloads all necessary data when called.
   */
  async reloadAll() {
    this.dataSubscriptions();
    await this.loadUsers();
    await this.checkUserAuthId();
    this.getCurrentChannel();
    this.getParticipantsSub();
    this.filteredUsers = this.pingUserControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterUsers(value || ''))
    );
  }


  /**
   * After the view has been checked, ensures scrolling to the bottom if necessary.
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
   * Handles scrolling behavior to determine if the user should be scrolled to the bottom of the thread.
   */
  handleScroll() {
    const threshold = 1;
    const position = this.threadContainer.nativeElement.scrollTop + this.threadContainer.nativeElement.offsetHeight;
    const height = this.threadContainer.nativeElement.scrollHeight;
    this.shouldScrollToBottom = position > height - threshold;
  }

  /**
   * Filters users based on a search value.
   *
   * @param {string} value - The search value to filter users.
   * @returns {any[]} - The filtered list of users.
   */
  private _filterUsers(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.users.filter((user: any) =>
      user.name.toLowerCase().startsWith(filterValue)
    );
  }


   /**
   * Subscribes to data services for users and channels, updating local data when changes occur.
   */
  dataSubscriptions() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.channelSub) {
      this.channelSub.unsubscribe();
    }
    this.userSub = this.dataService.getUsersList().subscribe((users: any) => {
      this.users = users;

    });
    this.channelSub = this.dataService.getChannelsList().subscribe((channels) => {
      this.channels = channels;
    });
  }


  /**
   * Loads users asynchronously and assigns them to the `users` property.
   */
  async loadUsers() {
    this.users = await firstValueFrom(this.dataService.getUsersList());
    this.channels = await firstValueFrom(this.dataService.getChannelsList());
  }


  /**
   * Checks the current user's authentication ID and finds the corresponding user data.
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
   * Finds the current user object from the loaded users list.
   */
  async findCurrentUser() {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].authUserId === this.userAuthId) {
        this.currentUser = new User(this.users[i]);
        break;
      }
    }
  }



  /**
   * Subscribes to participant images for the current channel.
   */
  getParticipantsSub() {
    if (this.channelParticipantsSub) {
      this.channelParticipantsSub.unsubscribe();
    }
    this.channelParticipantsSub = this.dataService.getParticipantImages(this.channelId).subscribe((participantsImages: any) => {
      this.participantsImages = participantsImages;
    });
  }


  /**
   * Retrieves the current channel object based on the channel ID.
   */
  getCurrentChannel() {
    for (let i = 0; i < this.channels.length; i++) {
      if (this.channels[i].channelId === this.channelId) {
        this.currentChannel = new Channel(this.channels[i]);
        break;
      }
    }
  }

  /**
   * Retrieves the channel ID from the route URL parameters.
   */
  getChannelIdFromURL() {
    this.route.params.subscribe(params => {
      this.channelId = params['id'];
    });
  }

  /**
   * Adds an emoji to the message input box.
   *
   * @param {string} emoji - The emoji to add.
   */
  addEmoji(emoji: string) {
    let textAreaElement = this.threadMessageBox.nativeElement;
    textAreaElement.value += emoji;
  }


  /**
   * Adds a user's name to the message input box for pinging.
   *
   * @param {any} user - The user to ping.
   */
  addUserToMessage(user: any) {
    if (this.threadMessageBox && user) {
      this.threadMessageBox.nativeElement.value += "@" + user.name + " ";
      this.pingUserControl.setValue("");
      this.menuTrigger.closeMenu();
    }
  }

  /**
   * Cleans up subscriptions and event listeners when the component is destroyed.
   */
  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.channelSub.unsubscribe();
    this.threadContainer.nativeElement.removeEventListener('scroll', this.handleScroll.bind(this));
    this.emojiSubscription.unsubscribe();
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    this.channelParticipantsSub.unsubscribe();
  }

  
   /**
   * Resets the message input form and removes any attached images.
   */
  removeChatInput() {
    this.channelThreadMessage.reset();
    this.addImgToMessageComponent.removeImage();
  }


  /**
   * Sends a message in the channel chat, including text and optionally an image.
   */
  async sendMessage() {
    if (this.threadMessageBox.nativeElement.value.length > 0 || this.addImgToMessageComponent.imgFile) {
      let newThread = await this.currentUser.sendChannelMessage(
        this.currentChannel,
        this.threadMessageBox.nativeElement.value,
        this.addImgToMessageComponent.imgFile,
      );
      if (newThread instanceof Thread) {
        this.dataService.addThread(newThread);
      }
    } else {
      console.log('Nachricht nicht gesendet');
    }
  }


  /**
   * Opens a dialog to add users to the current channel.
   */
  openAddUsersDialog() {
    this.dialog.open(AddUsersComponent, {
      data: {
        channelId: this.channelId,
        currentChannel: this.currentChannel
      }
    });
  }
}
