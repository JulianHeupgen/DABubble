import { Component, Input, SimpleChanges } from '@angular/core';
import { Channel } from '../../../models/channel.class';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { User } from '../../../models/user.class';
import { DataService } from '../../../services/data.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [MatFormField, MatLabel, FormsModule, MatInputModule, CommonModule],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss'
})
export class EditChannelComponent {

  constructor(public dataService: DataService) {}

  ngOnInit() {
    this.channelCreator = this.getChannelCreator();
    this.compareChannelCreatorWithCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentChannel']) {
      this.channelCreator = this.getChannelCreator();
      this.compareChannelCreatorWithCurrentUser();
    }
  }

  @Input() currentChannel!: Channel;
  @Input() currentUser!: User; 
  @Input() channelId!: string;
  @Input() matMenuTrigger!: MatMenuTrigger;

  editChannelName_Activated: boolean = false;
  editChannelDescription_Activated: boolean = false;
  showNameError: boolean = false;
  showDescriptionError: boolean = false;
  temporaryChannelName: string = '';
  temporaryChannelDescription: string = '';
  channelCreator!: string;
  channelCreatorIsCurrentUser: boolean = false;


   getChannelCreator(): string {
    const creatorId = this.currentChannel.createdBy;
    const creator = this.dataService.allUsers.find(user => user.id === creatorId);
    return creator ? creator.name : 'Unbekannter Ersteller';
  }


  compareChannelCreatorWithCurrentUser() {
    const creatorId = this.currentChannel.createdBy;
    const currentUserId = this.currentUser.id;
    this.channelCreatorIsCurrentUser = creatorId === currentUserId;
  }


  closeMenu() {
    this.editChannelName_Activated = false;
    this.editChannelDescription_Activated = false;
    this.matMenuTrigger.closeMenu();
  }


  editChannelName() {
    this.editChannelName_Activated = !this.editChannelName_Activated;
  }


  editChannelDescription() {
    this.editChannelDescription_Activated = !this.editChannelDescription_Activated;
  }


  validateChannelName(event: Event) {
    const input = event.target as HTMLInputElement;
    this.temporaryChannelName = input.value;
    this.showNameError = this.temporaryChannelName.length < 3;
  }


  saveNameChanges(){
    if (this.temporaryChannelName.length >= 3) {
      this.currentChannel.title = this.temporaryChannelName;
      this.dataService.updateChannel(this.currentChannel);
      this.editChannelName_Activated = !this.editChannelName_Activated;
    } else {
      this.showNameError = true;
    }
  }


  validateChannelDescription(event: Event) {
    const input = event.target as HTMLInputElement;
    this.temporaryChannelDescription = input.value;
    this.showDescriptionError = this.temporaryChannelDescription.length < 6;
  }


  saveDescriptionChanges(){
    if (this.temporaryChannelDescription.length >= 6) {
      this.currentChannel.description = this.temporaryChannelDescription;
      this.dataService.updateChannel(this.currentChannel);
      this.editChannelDescription_Activated = !this.editChannelDescription_Activated;
    } else {
      this.showDescriptionError = true;
    }
  }


  leaveChannel() {
    this.currentUser.leaveChannel(this.channelId, this.currentChannel);
    this.dataService.updateUser(this.currentUser);
    this.dataService.updateChannel(this.currentChannel);
    this.matMenuTrigger.closeMenu();
  }
}

