import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Thread } from '../models/thread.class';
import { User } from '../models/user.class';
import { Channel } from '../models/channel.class';
import { DataService } from './data.service';
import { deleteObject, getStorage, ref } from '@angular/fire/storage';
import { Message } from '../models/message.class';

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

  constructor(private dataService: DataService) {}
  
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



  copyMessageForFirebase(originMessage: Message) {
    let messageCopy = new Message(
      { id: originMessage.senderId,
        name: originMessage.senderName
      },
      originMessage.content,
      originMessage.imgFileURL
    );
    messageCopy.timestamp = originMessage.timestamp;
    messageCopy.replies = originMessage.replies.map((reply: any) => Message.fromJSON(reply));
    messageCopy.emojiReactions = originMessage.emojiReactions;
    messageCopy.editMode = originMessage.editMode;
    messageCopy.hoverReactionbar = originMessage.hoverReactionbar;

    this.dataService.updateMessage(messageCopy).then(() => {
      console.log('Message successfully updated in Firebase');
    }).catch((err: any) => {
      console.error('Update failed', err);
    });
  }


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

