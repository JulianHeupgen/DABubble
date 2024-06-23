import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Thread } from '../models/thread.class';
import { User } from '../models/user.class';
import { Channel } from '../models/channel.class';
import { deleteObject, getStorage, ref } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private threadSource = new Subject<any>();
  private threadChangesSource = new Subject<any>();
  private threadMessageSource = new Subject<any>();
  private openCurrentFullThreadSource = new Subject<any>();

  currentThread$ = this.threadSource.asObservable();
  updateThread$ = this.threadChangesSource.asObservable();
  currentMessages$ = this.threadMessageSource.asObservable();
  openCurrentThread$ = this.openCurrentFullThreadSource.asObservable();

  constructor() {}
  
   /**
   * Changes the current thread and notifies observers.
   *
   * @param {Thread} thread - The thread to switch to.
   * @param {User} threadOwner - The owner of the thread.
   * @param {Channel} currentChannel - The current channel.
   * @param {User} currentUser - The current user.
   * @returns {Promise<void>} - A promise that resolves when the thread change is complete.
   */
  changeThread(thread: Thread, threadOwner: User, currentChannel: Channel, currentUser: User): Promise<void> {
    return new Promise((resolve) => {
      this.threadSource.next({ thread, threadOwner, currentChannel, currentUser });
      resolve();
    });
  }


   /**
   * Opens or closes the full thread view.
   *
   * @param {boolean} openFullThreadBoolean - Whether to open or close the full thread view.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  openFullThread(openFullThreadBoolean: boolean): Promise<void> {
    return new Promise((resolve) => {
      this.openCurrentFullThreadSource.next(openFullThreadBoolean);
      resolve();
    })
  }


  /**
   * Sends a request to update reactions for a message in a thread.
   *
   * @param {Thread} thread - The thread containing the message.
   */
  getReactionsForMessage(thread: Thread) {
    let update = 'updateReaction'
    this.threadMessageSource.next({ thread, update });
  }


   /**
   * Sends a request to update the changes in a thread.
   *
   * @param {Thread} thread - The thread to update.
   */
  getThreadChanges(thread: Thread) {
    let update = 'updateThread'
    this.threadChangesSource.next({ thread, update });
  }


  /**
   * Deletes a file associated with a message from the storage.
   *
   * @param {string} imgFileLink - The link to the image file to delete.
   */
  deletFileOfMessage(imgFileLink: string) {
    const storage = getStorage();
    const desertRef = ref(storage, imgFileLink);
    deleteObject(desertRef).then(() => {
      return
    }).catch((error) => {
      console.error(error);
    }); 
  }
}

