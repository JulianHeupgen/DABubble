import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { RouterModule } from '@angular/router';

/**
 * @component ImprintComponent
 * This component displays the imprint information of the application.
 */
@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCard, MatCardContent],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {

  /**
   * Creates an instance of ImprintComponent.
   * @param {Location} location - The location service for navigating back.
   */
  constructor(private location: Location) { }

  /**
   * Navigates back to the previous location in the browser history.
   * @memberof ImprintComponent
   */
  goBack() {
    this.location.back();
  }

}
