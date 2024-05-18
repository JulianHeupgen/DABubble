import { Component, Input } from '@angular/core';
import { Channel } from '../../../models/channel.class';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { User } from '../../../models/user.class';
import { DataService } from '../../../services/data.service';
import { MatMenuTrigger } from '@angular/material/menu';


@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [MatFormField, MatLabel, FormsModule, MatInputModule],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss'
})
export class EditChannelComponent {

  constructor(public dataService: DataService) {}

  @Input() currentChannel!: Channel;
  @Input() currentUser!: User; 
  @Input() channelId!: string;
  @Input() matMenuTrigger!: MatMenuTrigger;


  closeMenu() {
    this.matMenuTrigger.closeMenu();
  }


  leaveChannel() {
    this.currentUser.leaveChannel(this.channelId, this.currentChannel);
    this.dataService.updateUser(this.currentUser);
    this.dataService.updateChannel(this.currentChannel);
    this.matMenuTrigger.closeMenu();
  }
}

