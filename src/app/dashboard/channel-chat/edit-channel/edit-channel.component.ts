import { Component, Input } from '@angular/core';
import { Channel } from '../../../models/channel.class';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [MatFormField, MatLabel, FormsModule, MatInputModule],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss'
})
export class EditChannelComponent {

  @Input() currentChannel!: Channel;
  @Input() currentUser!: User;
  @Input() channelId!: string;

  title: string = '';
  description: string = '';

  ngOnInit() {
    if (this.currentChannel && this.currentUser && this.channelId) {
      this.title = this.currentChannel.title || '';
      this.description = this.currentChannel.description || '';
      console.log(this.currentUser);
    }
  }

  onTitleChange() {
    if (this.currentChannel) {
      this.currentChannel.title = this.title;
    }
  }

  onDescriptionChange() {
    if (this.currentChannel) {
      this.currentChannel.description = this.description;
    }
  }

  leaveChannel() {
    console.log("Hello");
    // this.currentUser.leaveChannel(this.channelId, this.currentChannel);
  }
}
