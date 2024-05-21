import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Thread } from '../models/thread.class';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {

  private threadSource = new BehaviorSubject<Thread | null>(null);
  currentThread = this.threadSource.asObservable();

  constructor() { }

  changeThread(thread: Thread) {
    this.threadSource.next(thread);
  }


}
