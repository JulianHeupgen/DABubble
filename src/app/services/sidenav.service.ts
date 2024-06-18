import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {
  windowWidth: number = window.innerWidth;
  opened: boolean = true;
  showChannels: boolean = true;
  showDirectMessages: boolean = true;
  screenIsSmall: boolean = false;


  constructor() {
    this.updateScreenSize();
  }


  /**
  * Toggles the state of various UI components based on the provided value.
  * This method manages the open state of sidenav elements including the main sidenav,
  * channels list, and private messages. It checks the provided value to determine
  * which component's visibility should be toggled.
  *
  * @param {string} value - The component identifier to toggle. Valid values are
  *                         'sidenav', 'channels', and 'private', each corresponding
  *                         to different parts of the UI.
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


  /**
  * Toggles the sidenav based on the current window width.
  * This method checks if the window width is 650 pixels or less,
  * and if true, it delegates the toggle action to the `toggleSidenav` method.
  * It is used to conditionally toggle sidenav elements based on the screen size,
  * ensuring that UI adjustments are responsive.
  *
  * @param {string} value - The identifier for the sidenav component to be toggled.
  */
  toggleSidenavIfScreenIsSmall(value: string) {
    if (this.windowWidth <= 650) {
      this.toggleSidenav(value);
    }
  }


  /**
  * Updates the `screenIsSmall` property based on the current window width.
  * Sets `screenIsSmall` to true if the window width is 650 pixels or less,
  * otherwise sets it to false. This method is typically used to adjust UI elements
  * based on the screen size for responsive design purposes.
  */
  updateScreenSize() {
    this.screenIsSmall = window.innerWidth <= 1050;
  }
}
