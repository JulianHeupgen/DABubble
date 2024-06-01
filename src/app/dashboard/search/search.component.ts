import { Component } from '@angular/core';
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
import { Observable, map, startWith, switchMap } from 'rxjs';

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

  control = new FormControl('');
  isPanelOpen: boolean = false;
  users: User[] = [];
  filteredUsers!: Observable<User[]>;
  filteredChannels!: Observable<Channel[]>;
  channels: Channel[] = [];
  currentUser!: User;


  constructor(
    public dataService: DataService,
    public dialog: MatDialog,
    private auth: AuthService
  ) { }


  /**
   * Initializes the user and channel data after the component is loaded.
   *
   * This function fetches user and channel data from the data service and populates the following properties:
   * `users`: An array of all users.
   * `currentUser`: The currently authenticated user object.
   * `channels`: An array of all channels (if the user has channel information).
   * `filteredUsers`: An array of filtered users (implementation assumed to be in `initFilteredUsers`).
   * `filteredChannels`: An array of filtered channels (implementation assumed to be in `initFilteredChannel`).
   *
   * It also handles potential errors during data fetching.
   */
  ngOnInit() {
    try {
      this.auth.getUserAuthId().then(userId => {
        this.dataService.getUsersList().pipe(
          switchMap((users: any) => {
            this.users = users;
            this.currentUser = users.find((u: any) => u.authUserId === userId);
            this.initFilteredUsers();
            return this.dataService.getChannelsList();
          })
        ).subscribe((channels: any) => {
          if (this.currentUser.channels) {
            this.channels = channels.filter((channel: any) => this.currentUser.channels.includes(channel.channelId));
            this.initFilteredChannel();
          }
        });
      });
    } catch (error) {
      console.error(error);
    }
  }


  /**
   * Initializes the observable stream for filtered users based on the control value changes.
   * Subscribes to the control's valueChanges observable and applies filtering logic through the filterUsers function.
   * The filtered users are then assigned to the `filteredUsers` property.
   */
  initFilteredUsers() {
    this.filteredUsers = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this.filterUsers(value ?? ''))
    );
  }


  /**
   * Filters a list of users based on a search value.
   * 
   * @param value - The search value to use for filtering.
   * @returns - An array of users that match the search criteria.
   */
  filterUsers(value: string): User[] {
    if (!value) return this.users;
    const filterValue = value.toLowerCase();
    return this.users.filter(user => user.name.toLowerCase().includes(filterValue));
  }


  /**
   * Initializes the observable stream for filtered channels based on the control value changes.
   * Subscribes to the control's valueChanges observable and applies filtering logic through the filterChannels function.
   * The filtered channels are then assigned to the `filteredChannels` property.
  */
  initFilteredChannel() {
    this.filteredChannels = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this.filterChannels(value ?? ''))
    );
  }


  /**
   * Filters a list of channels based on a search value.
   * 
   * @param value - The search value to use for filtering.
   * @returns - An array of channels that match the search criteria.
   */
  filterChannels(value: string): Channel[] {
    if (!value) return this.channels;
    const filterValue = value.toLowerCase();
    return this.channels.filter(channel => channel.title.toLowerCase().includes(filterValue));
  }


  /**
     * Returns a list of channels for the current user.
     *
     * This function filters the available channels based on the current user's channel subscriptions.
     * It returns an empty array if the current user has no channel information.
     *
     * @returns - An array of channels that the current user has access to.
     */
  showChannels(): Channel[] {
    if (!this.currentUser.channels) {
      return [];
    }
    return this.channels.filter(channel => this.currentUser.channels.includes(channel.channelId));
  }


  /**
   * Opens a dialog to view the profile of a participant.
   * 
   * @param participant - The participant object to display in the profile view.
   */
  openProfile(participant: any): void {
    this.dialog.open(ViewProfileComponent, { data: participant });
    this.control.reset();
  }


  /**
   * Resets the control after a selection event.
   * This function is likely triggered by a user interaction (e.g., clicking on an item in a list).
   * It resets the state of the `control` property, which is assumed to be a form control or similar element.
   */
  onSelection(): void {
    this.control.reset();
  }
}