import { Component, Input, SimpleChanges } from '@angular/core';
import { Channel } from '../../../models/channel.class';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { User } from '../../../models/user.class';
import { DataService } from '../../../services/data.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [MatFormField, MatLabel, FormsModule, MatInputModule, CommonModule, RouterLink],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss'
})
export class EditChannelComponent {

  constructor(public dataService: DataService) {}

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
  currentChannelIsDevTeamChannel: boolean = false;


  ngOnInit() {
    this.channelCreator = this.getChannelCreator();
    this.compareChannelCreatorWithCurrentUser();
    this.checkIfDevTeamChannel();
  }


  /**
 * Responds to changes in the input properties of the component.
 *
 * @param {SimpleChanges} changes - An object that holds the current and previous values of the component's input properties.
 */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentChannel']) {
      this.channelCreator = this.getChannelCreator();
      this.compareChannelCreatorWithCurrentUser();
      this.checkIfDevTeamChannel();
    }
  }


  /**
 * Retrieves the name of the creator of the current channel.
 *
 * @returns {string} The name of the channel creator, or 'Unbekannter Ersteller' if the creator is not found.
 */
   getChannelCreator(): string {
    const creatorId = this.currentChannel.createdBy;
    const creator = this.dataService.allUsers.find(user => user.id === creatorId);
    return creator ? creator.name : 'Unbekannter Ersteller';
  }


  /**
 * Compares the creator of the current channel with the current user to determine if they are the same.
 * Sets the boolean flag `channelCreatorIsCurrentUser` accordingly.
 */
  compareChannelCreatorWithCurrentUser() {
    const creatorId = this.currentChannel.createdBy;
    const currentUserId = this.currentUser.id;
    this.channelCreatorIsCurrentUser = creatorId === currentUserId;
  }


  /**
 * Checks if the current channel is the Devteam channel by comparing its channelId with a specific ID.
 * Sets the boolean flag `currentChannelIsDevTeamChannel` accordingly.
 */
  checkIfDevTeamChannel() {
    this.currentChannelIsDevTeamChannel = this.currentChannel.channelId === 'Yk2dgejx9yy7iHLij1Qj';
  }


  /**
 * Closes any open menu and resets edit flags for channel name and description.
 * Uses `matMenuTrigger` to close the menu.
 */
  closeMenu() {
    this.editChannelName_Activated = false;
    this.editChannelDescription_Activated = false;
    this.matMenuTrigger.closeMenu();
  }


  /**
 * Toggles the activation state of editing the channel name.
 * Sets `editChannelName_Activated` to its opposite value.
 */
  editChannelName() {
    this.editChannelName_Activated = !this.editChannelName_Activated;
  }


  /**
 * Toggles the activation state of editing the channel description.
 * Sets `editChannelDescription_Activated` to its opposite value.
 */
  editChannelDescription() {
    this.editChannelDescription_Activated = !this.editChannelDescription_Activated;
  }


  /**
 * Validates the channel name based on the input event.
 * Sets `temporaryChannelName` to the current input value from the event target.
 * Sets `showNameError` to true if the length of `temporaryChannelName` is less than 3 characters, otherwise false.
 *
 * @param {Event} event - The input event containing the target element.
 */
  validateChannelName(event: Event) {
    const input = event.target as HTMLInputElement;
    this.temporaryChannelName = input.value;
    this.showNameError = this.temporaryChannelName.length < 3;
  }


  /**
 * Saves changes made to the channel name if the new name is valid (at least 3 characters long).
 * Updates `currentChannel.title` with `temporaryChannelName`.
 * Calls `dataService.updateChannel` to update the channel with the new name.
 * Deactivates editing mode for the channel name (`editChannelName_Activated` set to false) upon successful save.
 * Sets `showNameError` to true if the length of `temporaryChannelName` is less than 3 characters.
 * 
 * Preconditions:
 * - Assumes `temporaryChannelName` has been previously set via `validateChannelName` or similar method.
 */
  saveNameChanges(){
    if (this.temporaryChannelName.length >= 3) {
      this.currentChannel.title = this.temporaryChannelName;
      this.dataService.updateChannel(this.currentChannel);
      this.editChannelName_Activated = !this.editChannelName_Activated;
    } else {
      this.showNameError = true;
    }
  }


  /**
 * Validates the channel description based on the input event.
 * Sets `temporaryChannelDescription` to the current input value from the event target.
 * Sets `showDescriptionError` to true if the length of `temporaryChannelDescription` is less than 6 characters, otherwise false.
 *
 * @param {Event} event - The input event containing the target element.
 */
  validateChannelDescription(event: Event) {
    const input = event.target as HTMLInputElement;
    this.temporaryChannelDescription = input.value;
    this.showDescriptionError = this.temporaryChannelDescription.length < 6;
  }


  /**
 * Saves changes made to the channel description if the new description is valid (at least 6 characters long).
 * Updates `currentChannel.description` with `temporaryChannelDescription`.
 * Calls `dataService.updateChannel` to update the channel with the new description.
 * Deactivates editing mode for the channel description (`editChannelDescription_Activated` set to false) upon successful save.
 * Sets `showDescriptionError` to true if the length of `temporaryChannelDescription` is less than 6 characters.
 * 
 * Preconditions:
 * - Assumes `temporaryChannelDescription` has been previously set via `validateChannelDescription` or similar method.
 */
  saveDescriptionChanges(){
    if (this.temporaryChannelDescription.length >= 6) {
      this.currentChannel.description = this.temporaryChannelDescription;
      this.dataService.updateChannel(this.currentChannel);
      this.editChannelDescription_Activated = !this.editChannelDescription_Activated;
    } else {
      this.showDescriptionError = true;
    }
  }


  /**
 * Allows the current user to leave the current channel.
 * Removes the current user from the channel's participants list.
 * Updates both the user's and channel's data in the data service.
 * Closes any open menu using `matMenuTrigger`.
 */
  leaveChannel() {
    this.currentUser.leaveChannel(this.channelId, this.currentChannel);
    this.dataService.updateUser(this.currentUser);
    this.dataService.updateChannel(this.currentChannel);
    this.matMenuTrigger.closeMenu();
  }
}

