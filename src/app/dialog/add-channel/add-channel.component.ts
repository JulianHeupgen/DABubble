import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../../services/data.service';
import { Channel } from '../../models/channel.class';
import { ChannelMembersComponent } from '../channel-members/channel-members.component';
import { User } from '../../models/user.class';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

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
  showNameError: boolean = false;
  users: any;
  userAuthId!: string;
  currentUser!: User;
  private userSub: Subscription = new Subscription();

  constructor(public dialog: MatDialog, private dataService: DataService, private auth: AuthService) {
    this.userSub = this.dataService.getUsersList().subscribe((users: any) => {
      this.users = users;
    });

    this.checkUserAuthId();
  }

  async checkUserAuthId() {
    await this.auth.getUserAuthId().then(userId => {
      if (userId) {
        this.userAuthId = userId;
      } else {
        console.log("Kein Benutzer angemeldet.");
      }
    }).catch(error => {
      console.error("Fehler beim Abrufen der Benutzer-ID:", error);
    });

    setTimeout(() => {
      this.findCurrentUser(this.userAuthId);
    }, 600);
  }


  async findCurrentUser(authId: string) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].authUserId === authId) {
        this.currentUser = new User(this.users[i]);
        break;
      }
    }
  }


  async createChannel() {
    if (this.channelName.length < 3) {
      this.showNameError = true;
      return;
    }

    const newChannelData = new Channel({
      title: this.channelName,
      description: this.channelDescription,
      participants: [],
      createdBy: this.currentUser.id
      // threads: []
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

  resetForm() {
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

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

}