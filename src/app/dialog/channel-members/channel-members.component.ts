import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { from, switchMap } from 'rxjs';
import { Firestore, collection, getDocs, writeBatch, arrayUnion, doc } from '@angular/fire/firestore';
import { MatSelectModule } from '@angular/material/select';
import { DataService } from '../../services/data.service';



@Component({
  selector: 'app-channel-members',
  standalone: true,
  imports: [
    MatRadioModule,
    CommonModule,
    FormsModule,
    MatSelectModule
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

  // save() {
  //   if (!this.data.channelId) {
  //     console.error('Keine Kanal-ID verfügbar.');
  //     return;
  //   }
  //   this.addChannelToAllUsers().subscribe({
  //     next: () => {
  //       console.log('Kanal-ID wurde erfolgreich zu allen Benutzern hinzugefügt.');
  //       this.dialogRef.close();
  //     },
  //     error: (error) => {
  //       console.error('Fehler beim Hinzufügen der Kanal-ID zu allen Benutzern:', error);
  //     }
  //   });
  // }
}
