import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Channel } from '../../../models/channel.class';
import { MatFormField, MatFormFieldControl, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [MatFormField, MatLabel, FormsModule, MatInputModule],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss'
})
export class EditChannelComponent {

  @Input() currentChannel!: Channel;
  @Output() leaveChannelEvent = new EventEmitter<void>();

  title: string = '';
  description: string = '';

  ngOnInit() {
    if (this.currentChannel) {
      this.title = this.currentChannel.title || '';
      this.description = this.currentChannel.description || '';
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
    this.leaveChannelEvent.emit();
  }

}
