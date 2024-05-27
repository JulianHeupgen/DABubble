import { Component, inject } from '@angular/core';
import { Firestore, collection, onSnapshot, query, where } from '@angular/fire/firestore';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DataService } from '../../services/data.service';
import { User } from '../../models/user.class';
import { Observable, map, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ViewProfileComponent } from '../../dialog/view-profile/view-profile.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  firestore: Firestore = inject(Firestore);
  control = new FormControl('');
  isPanelOpen: boolean = false;
  users: User[] = [];

  

  constructor(
    public dataService: DataService,
    public dialog: MatDialog
  ) {}

  showUsers() {
    return this.dataService.allUsers;
  }

  showChannels() {
    return this.dataService.allChannels;
  }

testTest() {
  const searchItem = this.control.value;
  const q = query(collection(this.firestore, 'users'), where('name', '==', searchItem));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    this.users = [];
    querySnapshot.forEach((doc) => {
      this.users.push(doc.data()['authUserId']);
    });
    console.log('Users =', this.users.join(','));
    
  });
}

openProfile(participant: any) {
  this.dialog.open(ViewProfileComponent, {
    data: participant
  }
 );
 this.control.reset();
}

}