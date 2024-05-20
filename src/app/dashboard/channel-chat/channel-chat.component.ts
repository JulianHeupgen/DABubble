import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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
import { Observable, Subscription, map, startWith } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuTrigger, MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { EmojiMartComponent } from '../emoji-mart/emoji-mart.component';
import { CommonModule } from '@angular/common';
import { AddImgToMessageComponent } from '../add-img-to-message/add-img-to-message.component';
import { EditChannelComponent } from './edit-channel/edit-channel.component';
import { EmojiCommunicationService } from '../../services/emoji-communication.service';

@Component({
  selector: 'app-channel-chat',
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
  ],
  templateUrl: './channel-chat.component.html',
  styleUrl: './channel-chat.component.scss'
})
export class ChannelChatComponent {

  @ViewChild('threadMessageBox') threadMessageBox!: ElementRef;
  @ViewChild('imgBox') imgBox!: ElementRef;
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  @ViewChild(AddImgToMessageComponent) addImgToMessageComponent!: AddImgToMessageComponent;
  emojiSubscription: Subscription;
  constructor(public dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    public storage: StorageService,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private emojiService: EmojiCommunicationService,
  ) {
    this.emojiSubscription = this.emojiService.emojiEvent$.subscribe(event => {
      if (event.sender === 'ChannelChatComponent') {
        this.addEmoji(event.emoji);
      }
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
       this.ngOnInit();
      }
     });
    }


  userAuthId!: string;
  users: any;
  currentUser!: User;
  channels: any;
  channelId: string = '';
  currentChannel!: Channel;
  channelParticipants: any = [];
  channelParticipantsCounter: number = 0;
  threads: any;
  channelThreads!: Thread[];
  imgFile: File | undefined = undefined;


  private userSub: Subscription = new Subscription();
  private channelSub: Subscription = new Subscription();
  private threadsSub: Subscription = new Subscription();




  //-------------------//

  pingUserControl = new FormControl('');
  filteredUsers!: Observable<any[]>;



  //------------------//


  async ngOnInit() {
    this.resetParticipantsData();
    this.dataSubscriptions();
    await this.checkUserAuthId();



    setTimeout(() => {
      this.getChannelInfos();

      this.filteredUsers = this.pingUserControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filterUsers(value || ''))
      );
    }, 600);


  }


  private _filterUsers(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.users.filter((user: any) => user.name.toLowerCase().startsWith(filterValue));
  }

  resetParticipantsData() {
    this.channelParticipants = [];
    this.channelParticipantsCounter = 0;
  }


  dataSubscriptions() {
    this.userSub = this.dataService.getUsersList().subscribe((users: any) => {
      this.users = users;
    });
    this.channelSub = this.dataService.getChannelsList().subscribe(channels => {
      this.channels = channels;
    });
    this.threadsSub = this.dataService.getThreadsList().subscribe(threads => {
      this.threads = threads;
      this.getChannelInfos()
    })
}


  async checkUserAuthId() {
    await this.auth.getUserAuthId().then(userId => {
      if (userId) {
        this.userAuthId = userId;
      } else {
        console.log("Kein Benutzer angemeldet.");
      }
    }).catch(error => {
      console.error("Fehler beim Abrufen der Benutzer-ID:", error);
    });

    setTimeout(() => {
      this.findCurrentUser(this.userAuthId);
    }, 500);
  }


  async findCurrentUser(authId: string) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].authUserId === authId) {
        this.currentUser = new User(this.users[i]);
        break;
      }
    }
  }


  getChannelInfos() {
    this.getCurrentChannel();
    this.showChannelParticipants(this.channelId);
    this.getChannelThreads(this.channelId);
  }


  async getCurrentChannel() {
    this.getChannelIdFromURL();

    for (let i = 0; i < this.channels.length; i++) {
      if (this.channels[i].channelId === this.channelId) {
        this.currentChannel = new Channel(this.channels[i]);
        break;
      }
    }
  }



  getChannelIdFromURL() {
    this.route.params.subscribe(params => {
      this.channelId = params['id'];
    });
  }


  async showChannelParticipants(channelId: string) {
    await this.users.forEach((user: any) => {
      if (user.channels && user.channels.includes(channelId)) {
        this.channelParticipants.push({
          participantImage: user.imageUrl
        }
        );
        this.channelParticipantsCounter++;
      }
    });
  }


  async getChannelThreads(channelId: string) {
    this.channelThreads = [];

    for (let i = 0; i < this.threads.length; i++) {
      if (this.threads[i].channelId === channelId) {
        this.channelThreads.push(new Thread(this.threads[i]));
      }
    }
    
    this.sortThreadByFirstMessageTimestamp();
    
  }

  sortThreadByFirstMessageTimestamp() {
    this.channelThreads.sort((a, b) => a.timestamp - b.timestamp);
  }

  channelThreadMessage: FormGroup = this.formBuilder.group({
    channelMessage: '',
  })

  addEmoji(emoji: string) {
    let textAreaElement = this.threadMessageBox.nativeElement;
    textAreaElement.value += emoji;
  }

  addUserToMessage(user: any) {
    if (this.threadMessageBox && user) {
      this.threadMessageBox.nativeElement.value += '@' + user.name + ' ';
      this.pingUserControl.setValue('');
      this.menuTrigger.closeMenu();
    }
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.channelSub.unsubscribe();
    this.threadsSub.unsubscribe();
    this.emojiSubscription.unsubscribe();
  }

  removeChatInput() {
    this.channelThreadMessage.reset();
    this.addImgToMessageComponent.removeImage();
  }

  async sendMessage() {
    let newThread = await this.currentUser.sendChannelMessage(this.currentChannel, this.channelThreadMessage.value.channelMessage, this.imgFile)
    if (newThread instanceof Thread) {

      this.dataService.addThread(newThread);
    }
  }

}