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
  currentThread$ = this.threadSource.asObservable();
  openThread: boolean = false;
  
  constructor() { }

  changeThread(thread: Thread, threadOwner: User, currentChannel: Channel, currentUser: User) {
    this.threadSource.next({thread, threadOwner, currentChannel, currentUser});
  }

  getReactionsForMessage(thread: Thread) {
    let update = 'updateReaction'
    this.threadSource.next({thread, update});
  }


}
