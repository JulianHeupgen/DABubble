import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { from, switchMap } from 'rxjs';
import { Firestore, collection, getDocs, writeBatch, arrayUnion, doc } from '@angular/fire/firestore';
import { MatSelectModule } from '@angular/material/select';
import { DataService } from '../../services/data.service';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

// interface User {
//   id: string;
//   name: string;
//   imageUrl: string;
// }

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


  constructor(
    private firestore: Firestore,
    private dialogRef: MatDialogRef<ChannelMembersComponent>,
    public dialog: MatDialog,
    public dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: { channelId: string }
  ) { }


  addChannelToAllUsers() {
    const usersCollection = collection(this.firestore, 'users');
    return from(getDocs(usersCollection)).pipe(
      switchMap(querySnapshot => {
        const batch = writeBatch(this.firestore);
        querySnapshot.forEach(doc => {
          const userDocRef = doc.ref;
          batch.update(userDocRef, { channels: arrayUnion(this.data.channelId) });
        });
        return from(batch.commit());
      })
    );
  }


  addChannelToSpecificUsers() {
    const batch = writeBatch(this.firestore);
    this.selectedUsers.forEach(userId => {
      const userDocRef = doc(this.firestore, `users/${userId}`);
      batch.update(userDocRef, { channels: arrayUnion(this.data.channelId) });
    });
    return from(batch.commit());
  }


  save() {
    if (!this.data.channelId) {
      console.error('Keine ID verfügbar!');
      return;
    }
    if (this.selectedOption === 'all') {
      this.addChannelToAllUsers().subscribe({
        next: () => {
          console.log('Kanal ID wurde erfolgreich allen Nutzern hinzugefügt!');
          this.dialogRef.close();
        },
        error: (error) => {
          console.error('Fehler beim hinzufügen der Kanal ID!', error);
        }
      });
    } else if (this.selectedOption === 'specific') {
      this.addChannelToSpecificUsers().subscribe({
        next: () => {
          console.log('Kanal ID wurde erfolgreich den ausgewählten Nutzern hinzugefügt!');
          this.dialogRef.close();
        },
        error: (error) => {
          console.error('Fehler beim hinzufügen der Kanal ID!', error);
        }
      });
    }
  }


  removeUser(userId: string): void {
    this.selectedUsers = this.selectedUsers.filter(id => id !== userId);
  }


  getUserName(userId: string): string {
    const user = this.dataService.allUsers.find(u => u.id === userId);
    return user ? user.name : '';
  }


  getUserImg(userId: string): string {
    const user = this.dataService.allUsers.find(u => u.id === userId);
    return user ? user.imageUrl : '';
  }


  addUser(user: any) {
    this.selectedUsers.push(user);
  }
}