import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Thread } from '../models/thread.class';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {

  private threadSource = new Subject<any>();
  currentThread$ = this.threadSource.asObservable();

  constructor() { }

  changeThread(thread: Thread, threadOwner: User) {
    this.threadSource.next({thread, threadOwner});
  }


}
