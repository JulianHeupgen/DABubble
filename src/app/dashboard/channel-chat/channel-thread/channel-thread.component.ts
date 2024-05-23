import { Component, Input, ViewChild } from '@angular/core';
import { Thread } from '../../../models/thread.class';
import { CommonModule } from '@angular/common';
import { EmojiMartComponent } from '../../emoji-mart/emoji-mart.component';
import { ChannelChatComponent } from '../channel-chat.component';
import { MessageReactionComponent } from '../message-reaction/message-reaction.component';
import { DashboardComponent } from '../../dashboard.component';
import { DataService } from '../../../services/data.service';
import { ThreadService } from '../../../services/thread.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-channel-thread',
  standalone: true,
  imports: [
    CommonModule,
    MessageReactionComponent,
    EmojiMartComponent,
    // MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './channel-thread.component.html',
  styleUrl: './channel-thread.component.scss'
})
export class ChannelThreadComponent {

  @Input() thread!: Thread;
  @ViewChild(MessageReactionComponent) messageReaction!: MessageReactionComponent;

  isCurrentUser: boolean = false;
  setReactionMenuHover: boolean = false;

  constructor(
    public channelChat: ChannelChatComponent,
    public dashboard: DashboardComponent,
    public dataService: DataService,
    private threadService: ThreadService,
  ) { }

  ngOnInit() {
    let currentUserId = this.channelChat.currentUser.id;
    let messageOwnderId = this.thread.messages[0].sender.id
    if (currentUserId == messageOwnderId) {
      this.isCurrentUser = true;
    } else {
      this.isCurrentUser = false;
    }

  }

  formattedDatestamp(): any {
    return this.thread.getFormattedDatestamp();
  }

  formattedTimeStamp(): any {
    return this.thread.getFormattedTimeStamp();
  }

  openThread(thread: Thread) {
    this.threadService.changeThread(thread);
  }

  setHoverMenu() {
    this.setReactionMenuHover = true;
  }

  editMessageHandler() {
    // Logik für das Bearbeiten der Nachricht
    console.log('Edit message clicked');
  }
}

