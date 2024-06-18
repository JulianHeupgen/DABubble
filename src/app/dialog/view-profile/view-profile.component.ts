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

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, private sidenavService: SidenavService) { }


  closeProfile() {
    this.dialog.closeAll();
    if (window.innerWidth < 650) {
      this.sidenavService.toggleSidenavIfScreenIsSmall('sidenav');
    }
  }

}
