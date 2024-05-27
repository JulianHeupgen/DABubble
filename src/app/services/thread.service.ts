import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Thread } from '../models/thread.class';
import { User } from '../models/user.class';
import { Channel } from '../models/channel.class';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {

  private threadSource = new Subject<any>();
  private threadMessageSource = new Subject<any>();
  private openCurrentFullThreadSource = new Subject<any>();

  currentThread$ = this.threadSource.asObservable();
  currentMessages$ = this.threadMessageSource.asObservable();
  openCurrentThread$ = this.openCurrentFullThreadSource.asObservable();
  // isCurrentUser: boolean = false;
  // openThread: boolean = false;

  constructor() { }

  changeThread(thread: Thread, threadOwner: User, currentChannel: Channel, currentUser: User): Promise<void> {
    return new Promise((resolve) => {
      this.threadSource.next({ thread, threadOwner, currentChannel, currentUser });
      resolve();
    });
  }

  openFullThread(openFullThreadBoolean: boolean): Promise<void> {
    return new Promise((resolve) => {
      this.openCurrentFullThreadSource.next(openFullThreadBoolean);
      resolve();
    })
  }

  getReactionsForMessage(thread: Thread) {
    let update = 'updateReaction'
    this.threadMessageSource.next({ thread, update });
  }
}
