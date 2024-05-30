import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogContent } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [MatDialogContent, RouterLink],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss'
})
export class ViewProfileComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog) {}


  closeProfile() {
    this.dialog.closeAll();
  }

}
