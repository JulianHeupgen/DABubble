import { Component, inject } from '@angular/core';
import { Firestore, collection, onSnapshot, query, where } from '@angular/fire/firestore';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ReactiveFormsModule, MatAutocompleteModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  firestore: Firestore = inject(Firestore);

  // Test search component START
  control = new FormControl('');
  streets: string[] = ['Champs-Élysées', 'Lombard Street', 'Abbey Road', 'Fifth Avenue'];
  isPanelOpen: boolean = false;
  // Test Search END
  users: string[] = [];


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

}