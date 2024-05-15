import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatDialog,
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,  
} from '@angular/material/dialog';
import { DataService } from '../../services/data.service';
import { Channel } from '../../models/channel.class';

@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss'
})
export class AddChannelComponent {

  channelName: string = '';
  channelDescription: string = '';

  constructor(public dialog: MatDialog, private dataService: DataService) { }


  async createChannel() {
    if (!this.channelName.trim()) {
      alert('Bitte gib einen Kanalnamen ein');
      return;
    }

    const newChannelData = {
      title: this.channelName,
      description: this.channelDescription,
      participant: [],
      threads: []
    };

    const newChannel = this.dataService.setChannelObject('', newChannelData);

    try {
      await this.dataService.addChannel(new Channel(newChannel));
      console.log('Erfolgreich erstellt');
      this.resetForm();
      
    } catch (error) {
      console.warn('Fehler beim erstellen', error);
      
    }

  }

  private resetForm() {
    this.channelName = '';
    this.channelDescription = '';
    this.dialog.closeAll();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddChannelComponent, {
      data: {channelName: this.channelName, channelDescription: this.channelDescription},
      // panelClass: 'border-radius-30',        
      
    });
    // dialogRef.addPanelClass('border-radius-30');
  }

  closeDialog() {
    this.dialog.closeAll();
  }
}
