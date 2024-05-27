import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { Observable, from, map, startWith } from 'rxjs';
import { Firestore, writeBatch, arrayUnion, doc } from '@angular/fire/firestore';
import { DataService } from '../../services/data.service';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-channel-members',
  standalone: true,
  imports: [
    MatRadioModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatMenuModule,
    MatAutocompleteModule
  ],
  templateUrl: './add-users.component.html',
  styleUrl: './add-users.component.scss'
})
export class AddUsersComponent {

  selectedUsers: string[] = [];
  selectedUsersIds: string[] = [];
  userControl = new FormControl('');
  isPanelOpen!: boolean;
  filteredUsers!: Observable<User[]>;
  allUsers: User[] = [];

  constructor(
    private firestore: Firestore,
    private dialogRef: MatDialogRef<AddUsersComponent>,
    public dialog: MatDialog,
    public dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: { 
      channelId: string,
      currentChannel: Channel 
    }
  ) {
    this.allUsers = this.dataService.allUsers;
    this.filteredUsers = this.userControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterUsers(value ?? ''))
    );
  }

  /**
   * Filter function for selecting users during input via keyboard. 
   * Channel members and already selected users are filtered out.
   * 
   * @param value - string data from filteredUsers Observable
   * @returns - the filtered user
   */
  filterUsers(value: string): User[] {
    const filterValue = value.toLowerCase();
    return this.allUsers.filter(user =>
      user.name.toLowerCase().includes(filterValue) &&
      !user.channels.includes(this.data.channelId) &&
      !this.selectedUsersIds.includes(user.id))
  }


  /**
   * This function adds the channel to specific users when it is created.
   * Also the User will be added to the Channel´s participants
   * 
   * @returns - if the operation is successfully
   */
  addChannelToSpecificUsers() {               
    const batch = writeBatch(this.firestore);
    const channelDocRef = doc(this.firestore, `channels/${this.data.channelId}`);
    this.selectedUsersIds.forEach(userId => {
      const userDocRef = doc(this.firestore, `users/${userId}`);
      batch.update(userDocRef, { channels: arrayUnion(this.data.channelId) });
      batch.update(channelDocRef, { participants: arrayUnion(userId) });
    });
    return from(batch.commit());
  }


  /**
   * This function executes the final saving process of the addChannelToAllUsers or addChannelToSpecificUsers.
   * 
   * @returns - if the operation is not succesfully
   */
  save() {
    if (!this.data.channelId) {
      console.error('Keine ID verfügbar!');
      return;
    }

    this.addChannelToSpecificUsers().subscribe({
      next: () => {
        this.dialogRef.close();
      },
      error: (error) => {
        console.error('Fehler beim hinzufügen der Kanal ID!', error);
      }
    });
  }


  /**
   * This function removes the selected user from the selectedUsers and selectedUsersIds array.
   * 
   * @param userId - the userId is the Id from the specific selected user
   */
  removeUser(userId: string): void {
    this.selectedUsers = this.selectedUsers.filter(id => id !== userId);
    this.selectedUsersIds = this.selectedUsersIds.filter(id => id !== userId);
  }


  /**
   * This function searches for the username using the transferred userId from the allUsers array in the dataService.
   * 
   * @param userId - the userId is the Id from the specific selected user
   * @returns - the user name if the user is possible. 
   */
  getUserName(userId: string): string {
    const user = this.dataService.allUsers.find(u => u.id === userId);
    return user ? user.name : '';
  }


  /**
   * This function searches for the user avatar using the transferred userId from the allUsers array in the dataService.
   * 
   * @param userId - the userId is the Id from the specific selected user
   * @returns - the user avatar imageUrl if the user is possible. 
   */
  getUserImg(userId: string): string {
    const user = this.dataService.allUsers.find(u => u.id === userId);
    return user ? user.imageUrl : '';
  }


  /**
   * Adds a user to the list of selected users if it is not already included and resets the associated form control element.
   * 
   * @param userId - The unique ID of the user.
   * @param userName - The name of the user that is displayed.
   */
  toggleUserSelection(userId: string, userName: string): void {
    if (!this.selectedUsersIds.includes(userId)) {
      this.selectedUsers.push(userName);
      this.selectedUsersIds.push(userId);
    }
    this.userControl.reset();
  }


  /**
   * Opens a menu based on the input value and the current status of the menu. 
   * The function checks that the input value is not empty and that the menu is not currently open before the menu is opened.
   * 
   * @param trigger - The trigger that controls the menu.
   * @param event - The keyboard event that triggers this function, typically an input.
   */
  openMenu(trigger: MatMenuTrigger, event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.value.length > 0 && !trigger.menuOpen) {
      trigger.openMenu();
    }
  }

}

