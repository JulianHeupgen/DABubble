import { Component, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DataService } from '../../services/data.service';
import { User } from '../../models/user.class';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ViewProfileComponent } from '../../dialog/view-profile/view-profile.component';
import { RouterModule } from '@angular/router';
import { Channel } from '../../models/channel.class';
import { AuthService } from '../../services/auth.service';
import { switchMap } from 'rxjs';

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
  channels: Channel[] = [];
  currentUser!: User;
  

  constructor(
    public dataService: DataService,
    public dialog: MatDialog,
    private auth: AuthService
  ) {

  }


  // ngOnInit() {
  //   this.auth.getUserAuthId().then(userId => {
  //     this.dataService.getUsersList().subscribe((users: any) => {
  //       this.users = users;
  //       this.currentUser = users.find((u: any) => u.authUserId === userId);
  //       this.dataService.getChannelsList().subscribe((channels: any) => {
  //         if (this.currentUser.channels) {
  //           this.channels = channels.filter((channel: any) => this.currentUser.channels.includes(channel.channelId));
  //         }
  //       });
  //     });
  //   });
  // }

  ngOnInit() {
  this.auth.getUserAuthId().then(userId => {
    this.dataService.getUsersList().pipe(
      switchMap((users: any) => {
        this.users = users;
        this.currentUser = users.find((u: any) => u.authUserId === userId);
        return this.dataService.getChannelsList();
      })
    ).subscribe((channels: any) => {
      if (this.currentUser.channels) {
        this.channels = channels.filter((channel: any) => this.currentUser.channels.includes(channel.channelId));
      }
    });
  });
  }

  showChannels(): Channel[] {
    if (!this.currentUser.channels) {
      return [];
    }
    return this.channels.filter(channel => this.currentUser.channels.includes(channel.channelId));
  }


  openProfile(participant: any) {
    this.dialog.open(ViewProfileComponent, {
      data: participant
    }
    );
    this.control.reset();
  }


  onSelection(): void {
    this.control.reset();
  }
}