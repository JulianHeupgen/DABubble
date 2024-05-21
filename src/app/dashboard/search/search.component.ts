import { Component } from '@angular/core';
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


  // Test search component START
  control = new FormControl('');
  streets: string[] = ['Champs-Élysées', 'Lombard Street', 'Abbey Road', 'Fifth Avenue'];
  isPanelOpen: boolean = false;
  // Test Search END

}
