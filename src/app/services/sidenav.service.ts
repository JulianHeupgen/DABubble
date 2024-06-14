import { Injectable } from '@angular/core';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {

  opened: boolean = true;
  showChannels: boolean = true;
  showDirectMessages: boolean = true;

  constructor(private dataService: DataService) { }

    /**
   * Toggle variable for sidenav to open or close.
   */
    toggleSidenav(value: string) {
      if (value === 'sidenav') {
        this.opened = !this.opened;
      }
      if (value === 'channels') {
        this.showChannels = !this.showChannels;
      }
      if (value === 'private') {
        this.showDirectMessages = !this.showDirectMessages;
      }
    }


    toggleSidenavIfScreenIsSmall(value: string) {
      const screenWidth = window.innerWidth;
      const maxScreenWidth = 650;
      if (screenWidth <= maxScreenWidth) {
        this.toggleSidenav(value);
      }
    }
}
