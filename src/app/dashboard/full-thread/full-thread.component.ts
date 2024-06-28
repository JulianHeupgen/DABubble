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
import { Message } from '../../models/message.class';
import { DomSanitizer } from '@angular/platform-browser';

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
  sanitizedUrl: any;

  imgFileLink: string = '';
  isImgFileEdited: boolean = false;
  shouldScrollToBottom: boolean = true;
  addListenerForScroll: boolean = true

  pingUserControlFullThread = new FormControl("");
  filteredUsers!: Observable<any[]>;

  @ViewChild("imgBoxFullThread") imgBoxFullThread!: ElementRef<any>;
  @ViewChild("fullThreadMessageBox") fullThreadMessageBox!: ElementRef;
  @ViewChild("editFullThreadMessageBox") editFullThreadMessageBox!: ElementRef;
  @ViewChild(AddImgToMessageComponent) addImgToMessageComponent!: AddImgToMessageComponent;
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  @ViewChild("fullThreadContainer") fullThreadContainer!: ElementRef;


  /**
 * Constructor for the FullThreadComponent.
 * Initializes necessary services and subscriptions.
 *
 * @param {ThreadService} threadService - The service for thread-specific operations.
 * @param {FormBuilder} formBuilder - The form builder for creating forms.
 * @param {DataService} dataService - The service for data operations.
 * @param {EmojiCommunicationService} emojiService - The service for emoji communication.
 */
  constructor(
    public threadService: ThreadService,
    private formBuilder: FormBuilder,
    public dataService: DataService,
    private emojiService: EmojiCommunicationService,
    private domSanitizer: DomSanitizer,
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


  /**
 * FormGroup for the message in FullThreadComponent.
 * Contains the form control for the thread message.
 */
  fullThreadMessage: FormGroup = this.formBuilder.group({
    threadMessage: "",
  });


  /**
 * Called when the component is initialized.
 * Subscribes to currentThread$ from threadService to monitor changes in the current thread.
 * Filters and subscribes to changes in the user autocomplete.
 */
  ngOnInit(): void {
    this.threadService.currentThread$.subscribe(event => {
      if (event.thread) {
        this.sortNewDataFromThreadService(event)
        this.checkCurrentUser();
        this.sanitizedUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(event.thread.messages[0].imgFileURL);
      }
      this.getUsersOfThread();
      this.filteredUsers = this.pingUserControlFullThread.valueChanges.pipe(
        startWith(''),
        map(value => this._filterUsers(value || ''))
      );
    });
  }


  /**
 * Called after every check of the component's view.
 * Checks if the component should scroll to the bottom and performs the scroll if needed.
 */
  ngAfterViewChecked() {
    if (this.shouldScrollToBottom && this.fullThreadContainer) {
      this.scrollToBottom();
      if (this.addListenerForScroll) {
        this.fullThreadContainer.nativeElement.addEventListener('scroll', this.handleScroll.bind(this));
        this.addListenerForScroll = false;
      }
    }
  }


  /**
 * Scrolls the FullThreadContainer to the bottom.
 * Called when `shouldScrollToBottom` is true.
 */
  scrollToBottom() {
    if (this.fullThreadContainer) {
      try {
        this.fullThreadContainer.nativeElement.scrollTop = this.fullThreadContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error("Could not scroll to bottom:", err);
      }
    }
  }


  /**
 * Handles the scroll event of the FullThreadContainer.
 * Checks if scrolled to the bottom of the thread and sets `shouldScrollToBottom` accordingly.
 */
  handleScroll() {
    const threshold = 1;
    const position = this.fullThreadContainer.nativeElement.scrollTop + this.fullThreadContainer.nativeElement.offsetHeight;
    const height = this.fullThreadContainer.nativeElement.scrollHeight;
    this.shouldScrollToBottom = position > height - threshold;
  }


  /**
 * Updates thread-related data based on the received event.
 *
 * @param {any} event - The received event containing thread data.
 */
  sortNewDataFromThreadService(event: any) {
    this.thread = event.thread;
    this.threadOwner = event.threadOwner;
    this.currentUser = event.currentUser;
    this.currentChannel = event.currentChannel;
  }


  /**
 * Checks if the current user is the owner of the thread.
 * Updates `isCurrentUser` accordingly.
 */
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


  /**
 * Retrieves the users who have sent messages in the current thread.
 * Updates the `users` array based on the sent messages.
 */
  getUsersOfThread() {
    this.users = []
    const userMap = new Map<string, User>();
    this.thread?.messages.forEach(message => {
      this.dataService.allUsers.forEach(user => {
        if (user.id == message.senderId) {
          userMap.set(user.id, user);
        }
      })
    })
    this.users = Array.from(userMap.values());
  }


  /**
 * Closes the current thread.
 * Sets the thread to not open using `threadService`.
 */
  closeThread() {
    this.threadService.openFullThread(false);
  }


  /**
 * Filters the user list based on the entered value.
 * Compares the entered value with user names and returns the filtered list.
 *
 * @param {string} value - The value to filter the user list with.
 * @returns {any[]} - The filtered list of users.
 */
  private _filterUsers(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.users.filter((user: any) =>
      user.name.toLowerCase().startsWith(filterValue)
    );
  }


  /**
 * Adds a user to the message.
 * Sets the user's name in the text area and closes the user menu.
 *
 * @param {User} user - The user to add to the message.
 */
  addUserToMessage(user: User) {
    if (this.fullThreadMessage && user) {
      this.fullThreadMessageBox.nativeElement.value += "@" + user.name + " ";
      this.pingUserControlFullThread.setValue("");
      this.menuTrigger.closeMenu();
    }
  }


  /**
 * Sends the entered message or img in the current thread.
 * Optionally adds an image to the message and updates thread data in Firebase.
 */
  async sendMessage() {
    if (this.thread) {
      if (this.fullThreadMessageBox.nativeElement.value.length > 0 || this.addImgToMessageComponent.imgFile) {
        await this.currentUser.sendChannelMessage(
          this.currentChannel,
          this.fullThreadMessageBox.nativeElement.value,
          this.addImgToMessageComponent.imgFile,
          this.thread
        );
        let newThread = this.jsonToString(new Thread(this.thread));

        this.dataService.updateThread(newThread);
      }
    }
  }


  /**
 * Converts the messages of the thread to a string representation.
 *
 * @param {Thread} thread - The thread whose messages are to be converted.
 * @returns {Thread} - The thread with converted messages.
 */
  jsonToString(thread: Thread) {
    let stringedMessages: string[] = []
    thread.messages.forEach(message => {
      stringedMessages.push(JSON.stringify(message))
    })
    thread.messages = stringedMessages;
    return thread
  }


  /**
 * Adds an emoji to the message.
 *
 * @param {string} emoji - The emoji to add.
 */
  addEmoji(emoji: string) {
    let textAreaElement = this.fullThreadMessageBox.nativeElement;
    textAreaElement.value += emoji;
  }


  /**
 * Clears the input content.
 * Resets the form and removes the image from the message.
 */
  removeChatInput() {
    this.fullThreadMessage.reset();
    this.addImgToMessageComponent.removeImage();
  }


  /**
 * Enables editing mode for a message.
 *
 * @param {Message} messageObj - The message to edit.
 */
  editThreadMessage(messageObj: Message) {
    // this.setReactionMenuHover = false;
    messageObj.editMode = true;
  }


  /**
 * Cancels editing mode for a message.
 *
 * @param {Message} messageObj - The message whose editing is to be canceled.
 */
  cancelEditMessage(messageObj: Message) {
    messageObj.editMode = false;
    this.isImgFileEdited = false;
  }


  /**
 * Deletes the image URL from the first message in the provided object.
 * Sets `imgFileLink` to the deleted image URL and marks `isImgFileEdited` as true.
 *
 * @param {any} obj - The object containing messages with an image URL.
 */
  deleteImg(obj: any) {
    this.imgFileLink = obj.messages[0].imgFileURL;
    this.isImgFileEdited = true;
    obj.messages[0].imgFileURL = '';
  }


  /**
 * Saves the edited message content and optionally deletes associated image.
 * Updates message content and clears image URL if `isImgFileEdited` is true.
 * Copies updated message to Firebase through `threadService`.
 * Disables editing mode for the message.
 *
 * @param {Thread} messageElement - The thread containing the message to be edited.
 */
  async saveEditMessage(messageElement: Thread) {
    messageElement.messages[0].content = this.editFullThreadMessageBox.nativeElement.value
    if (this.isImgFileEdited) {
      this.threadService.deletFileOfMessage(this.imgFileLink)
      messageElement.messages[0].imgFileURL = '';
    }
    this.threadService.copyThreadForFirebase(messageElement)
    messageElement.messages[0].editMode = false;
  }
}

