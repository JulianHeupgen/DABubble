import { Injectable } from '@angular/core';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {
  windowWidth: number = window.innerWidth;
  opened: boolean = true;
  showChannels: boolean = true;
  showDirectMessages: boolean = true;
  screenIsSmall: boolean = false;


  constructor(private dataService: DataService) {
    this.updateScreenSize();
   }


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
      if (this.windowWidth <= 650) {
        this.toggleSidenav(value);
      }
    }


    updateScreenSize() {
      this.screenIsSmall = window.innerWidth <= 650;
    }
}
