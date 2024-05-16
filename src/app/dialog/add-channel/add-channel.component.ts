import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../services/data.service';
import { Channel } from '../../models/channel.class';
import { ChannelMembersComponent } from '../channel-members/channel-members.component';

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
  createdChannelId: string | null = null;

  constructor(public dialog: MatDialog, private dataService: DataService) { }


  async createChannel() {
    if (!this.channelName.trim()) {
      alert('Bitte gib einen Kanalnamen ein');
      return;
    }

    const newChannelData = new Channel({
      title: this.channelName,
      description: this.channelDescription,
      participants: [],
      threads: []
    });

    try {
      this.createdChannelId = await this.dataService.addChannel(newChannelData);
      console.log('Erfolgreich erstellt', this.createdChannelId);
      this.resetForm();
      this.openChannelMembersDialog();
    } catch (error) {
      console.warn('Fehler beim Erstellen', error);
    }
  }

  private resetForm() {
    this.channelName = '';
    this.channelDescription = '';
    this.dialog.closeAll();
  }

  openChannelMembersDialog() {
    if (this.createdChannelId) {
      setTimeout(() => {
        this.dialog.open(ChannelMembersComponent, {
          data: { channelId: this.createdChannelId }
        });
      }, 500);
    }
  }
}