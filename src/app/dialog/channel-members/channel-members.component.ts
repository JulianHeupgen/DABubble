import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { from, switchMap } from 'rxjs';
import firebase from 'firebase/compat/app';
import { Firestore, collection, getDocs, writeBatch, doc, arrayUnion } from '@angular/fire/firestore';



@Component({
  selector: 'app-channel-members',
  standalone: true,
  imports: [
    MatRadioModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './channel-members.component.html',
  styleUrl: './channel-members.component.scss'
})
export class ChannelMembersComponent {

  selectedOption = '';

  constructor(
    private firestore: Firestore,
    private dialogRef: MatDialogRef<ChannelMembersComponent>,
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


  save() {
    if (!this.data.channelId) {
      console.error('Keine Kanal-ID verfügbar.');
      return;
    }
    this.addChannelToAllUsers().subscribe({
      next: () => {
        console.log('Kanal-ID wurde erfolgreich zu allen Benutzern hinzugefügt.');
        this.dialogRef.close();
      },
      error: (error) => {
        console.error('Fehler beim Hinzufügen der Kanal-ID zu allen Benutzern:', error);
      }
    });
  }
}
