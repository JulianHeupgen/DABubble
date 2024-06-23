import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Thread } from '../models/thread.class';
import { User } from '../models/user.class';
import { Channel } from '../models/channel.class';
import { DataService } from './data.service';
import { deleteObject, getStorage, ref } from '@angular/fire/storage';

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

  constructor(
    private dataService: DataService,
  ) { }

  
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
   * Copies a thread and updates it in Firebase.
   *
   * @param {Thread} originThread - The original thread to copy and update.
   */
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


   /**
   * Converts thread messages to strings for Firebase.
   *
   * @param {Thread} thread - The thread whose messages need to be converted.
   */
  convertThreadMessagesToString(thread: any) {
    thread.messages = thread.messages.map((message: any) => JSON.stringify(message));
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
      console.log(error);
    }); 
  }


  /**
   * Copies a user chat thread and updates it in Firebase.
   *
   * @param {Thread} originThread - The original thread to copy and update.
   * @param {string | undefined} userChatId - The ID of the user chat.
   * @param {number | undefined} index - The index of the thread in the user chat.
   */
  copyUserChatThreadForFirebase(originThread: Thread, userChatId: string | undefined, index: number | undefined) {
    const threadCopy = new Thread({ ...originThread });
    threadCopy.messages = [...originThread.messages];
    this.convertThreadMessagesToString(threadCopy);

    this.dataService.updateUserChatThread(threadCopy, userChatId, index).then(() => {
      console.log('Thread successfully updated in Firebase');
    }).catch(err => {
      console.error('Update failed', err);
    });
  }
}

