import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderProfileService {

  private profileViewState = new BehaviorSubject<boolean>(false);
  profileViewState$ = this.profileViewState.asObservable();

  private profileEditState = new BehaviorSubject<boolean>(false);
  profileEditState$ = this.profileEditState.asObservable();

  /**
   * Switches the profile state to menu.
   * Sets both `profileViewState` and `profileEditState` to false.
   */
  switchToMenu() {
    this.profileViewState.next(false);
    this.profileEditState.next(false);
  }

  /**
   * Switches the profile state to view.
   * Sets `profileViewState` to true and `profileEditState` to false.
   */
  switchToView() {
    this.profileViewState.next(true);
    this.profileEditState.next(false);
  }

  /**
   * Switches the profile state to edit.
   * Sets `profileEditState` to true and `profileViewState` to false.
   */
  switchToEdit() {
    this.profileEditState.next(true);
    this.profileViewState.next(false);
  }

}
