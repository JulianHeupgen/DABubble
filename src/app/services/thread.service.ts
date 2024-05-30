import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Thread } from '../models/thread.class';
import { User } from '../models/user.class';
import { Channel } from '../models/channel.class';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {

  private threadSource = new Subject<any>();
  private threadChangesSource = new Subject<any>();
  private threadMessageSource = new Subject<any>();
  private openCurrentFullThreadSource = new Subject<any>();

  currentThread$ = this.threadSource.asObservable();
  updateThread$ = this.threadChangesSource.asObservable();
  currentMessages$ = this.threadMessageSource.asObservable();
  openCurrentThread$ = this.openCurrentFullThreadSource.asObservable();
  // isCurrentUser: boolean = false;
  // openThread: boolean = false;

  constructor(
    private dataService: DataService,
  ) { }

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

  getThreadChanges(thread: Thread) {
    let update = 'updateThread'
    this.threadChangesSource.next({ thread, update });
  }

  copyThreadForFirebase(originThread: Thread) {
    const threadCopy = new Thread({ ...originThread });
    threadCopy.messages = [...originThread.messages];
    this.convertThreadMessagesToString(threadCopy);
    this.dataService.updateThread(threadCopy).then(() => {
      console.log('Thread successfully updated in Firebase');
    }).catch(err => {
      console.error('Update failed', err);
    });
  }

  convertThreadMessagesToString(thread: any) {
    thread.messages = thread.messages.map((message: any) => JSON.stringify(message));
  }
}
