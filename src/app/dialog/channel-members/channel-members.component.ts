import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { Observable, from, map, startWith, switchMap } from 'rxjs';
import { Firestore, collection, getDocs, writeBatch, arrayUnion, doc } from '@angular/fire/firestore';
import { MatSelectModule } from '@angular/material/select';
import { DataService } from '../../services/data.service';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { User } from '../../models/user.class';


@Component({
  selector: 'app-channel-members',
  standalone: true,
  imports: [
    MatRadioModule,
    CommonModule,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatMenuModule,
    MatAutocompleteModule
  ],
  templateUrl: './channel-members.component.html',
  styleUrl: './channel-members.component.scss'
})
export class ChannelMembersComponent {

  selectedOption = 'all';
  selectedUsers: string[] = [];
  selectedUsersIds: string[] = [];
  userControl = new FormControl('');
  isPanelOpen: any;
  filteredUsers!: Observable<User[]>;
  allUsers: User[] = [];


  constructor(
    private firestore: Firestore,
    private dialogRef: MatDialogRef<ChannelMembersComponent>,
    public dialog: MatDialog,
    public dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: { channelId: string, createdBy: string }
  ) {
    this.allUsers = this.dataService.allUsers;
    this.filteredUsers = this.userControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterUsers(value ?? ''))
    );
  }


  /**
   * Filter function for selecting users during input via keyboard. 
   * Already selected users are filtered out.
   * 
   * @param value - string data from filteredUsers Observable
   * @returns - the filtered user
   */
  filterUsers(value: string): User[] {
    const filterValue = value.toLowerCase();
    return this.allUsers.filter(user =>
      user.name.toLowerCase().includes(filterValue) &&
      !this.selectedUsersIds.includes(user.id));
  }


  /**
   * This function adds the channel to all users when it is created.
   * 
   * @returns - if the operation is successfully
   */
  addChannelToAllUsers() {
    const usersCollection = collection(this.firestore, 'users');
    return from(getDocs(usersCollection)).pipe(
      switchMap(querySnapshot => {
        const batch = writeBatch(this.firestore);
        querySnapshot.forEach(docSnapshot => {
          const userDocRef = docSnapshot.ref;
          batch.update(userDocRef, { channels: arrayUnion(this.data.channelId) });
          const channelDocRef = doc(this.firestore, `channels/${this.data.channelId}`);
          batch.update(channelDocRef, { participants: arrayUnion(docSnapshot.id) });
        });
        return from(batch.commit());
      })
    );
  }


  /**
   * This function adds the channel to specific users when it is created.
   * 
   * @returns - if the operation is successfully
   */
  addChannelToSpecificUsers() {
    const batch = writeBatch(this.firestore);
    const channelDocRef = doc(this.firestore, `channels/${this.data.channelId}`);
    if (!this.selectedUsersIds.includes(this.data.createdBy)) {
      this.selectedUsersIds.push(this.data.createdBy);
    }
    this.selectedUsersIds.forEach(userId => {
      const userDocRef = doc(this.firestore, `users/${userId}`);
      batch.update(userDocRef, { channels: arrayUnion(this.data.channelId) });
      batch.update(channelDocRef, { participants: arrayUnion(userId) });
    });
    return from(batch.commit());
  }


  /**
   * Saves the channel settings based on the selected option. Closes the dialog on success.
   * It handles two scenarios: adding to all users or specific users based on the user's selection.
   */
  async save() {
    if (!this.data.channelId) {
      console.error('Keine ID verfügbar!');
      return;
    }
    try {
      await this.performChannelAddition();
      this.dialogRef.close();
    } catch (error) {
      console.error('Fehler beim hinzufügen der Channel ID!', error);
    }
  }


  /**
   * Performs the addition of the channel to all or specific users based on the selected option.
   * @returns {Promise<void>} A promise that resolves when the addition is completed.
   */
  performChannelAddition(): Promise<void> {
    const additionMethod = this.selectedOption === 'all' ? this.addChannelToAllUsers() : this.addChannelToSpecificUsers();
    return new Promise((resolve, reject) => {
      additionMethod.subscribe({
        next: resolve,
        error: reject
      });
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