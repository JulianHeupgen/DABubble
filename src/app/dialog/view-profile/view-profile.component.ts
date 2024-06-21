import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogContent } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { SidenavService } from '../../services/sidenav.service';

@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [MatDialogContent, RouterLink],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss'
})
export class ViewProfileComponent {
  /**
   * Constructor that injects the dialog data, MatDialog service, and SidenavService.
   * 
   * @param {any} data - Data passed to the dialog.
   * @param {MatDialog} dialog - Service for managing dialogs.
   * @param {SidenavService} sidenavService - Service for managing the sidenav state.
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog, 
    private sidenavService: SidenavService
  ) {}


  /**
   * Closes the profile dialog and toggles the sidenav if the screen width is less than 650 pixels.
   */
  closeProfile() {
    this.dialog.closeAll();
    if (window.innerWidth < 650) {
      this.sidenavService.toggleSidenavIfScreenIsSmall('sidenav');
    }
  }
}
