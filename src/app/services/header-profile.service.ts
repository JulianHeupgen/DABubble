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

  switchToMenu() {
    this.profileViewState.next(false);
  }

  switchToView() {
    this.profileViewState.next(true);
    this.profileEditState.next(false);
  }

  switchToEdit() {
    this.profileEditState.next(true);
  }

}
