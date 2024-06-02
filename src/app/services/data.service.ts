import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Channel } from '../models/channel.class';
import { Thread } from '../models/thread.class';
import { UserChat } from '../models/user-chat';
import { BehaviorSubject, Observable } from 'rxjs';
import { Unsubscribe } from '@angular/fire/auth';
import { Message } from '../models/message.class';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.getUsersList();
    this.getChannelsList();
    this.getUserChatsList();
  }

  allUsers: User[] = [];
  allChannels: Channel[] = [];
  allThreads: Thread[] = [];
  allUserChats: UserChat[] = [];

  groupedThreads: any = []
  firstLoad: boolean = false;
  currentChannelId: string = 'Yk2dgejx9yy7iHLij1Qj'
  groupedChannelThreads: BehaviorSubject<{ [key: string]: Thread[] }> = new BehaviorSubject({});
  private threadUnsubscribe!: Unsubscribe;

  getUsersList() {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(this.getUserCollection(), list => {
        this.allUsers = [];
        list.forEach(user => this.allUsers.push(this.setUserObject(user.id, user.data())))
        observer.next(this.allUsers);
      });
    });
  }

  getUserCollection() {
    return collection(this.firestore, 'users');
  }

  setUserObject(id: string, data: any): any {
    return {
      id: id,
      name: data.name,
      email: data.email,
      onlineStatus: data.onlineStatus,
      channels: data.channels,
      userChats: data.userChats,
      authUserId: data.authUserId,
      imageUrl: data.imageUrl,
    }
  }



  getChannelsList() {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(this.getChannelCollection(),
        list => {
          this.allChannels = [];
          list.forEach(channel => this.allChannels.push(this.setChannelObject(channel.id, channel.data())))
          observer.next(this.allChannels);
        });
    })
  }

  getChannelCollection() {
    return collection(this.firestore, 'channels');
  }

  setChannelObject(id: string, data: any): any {
    return {
      channelId: id,
      title: data.title,
      participants: data.participants,
      threads: data.threads,
      description: data.description,
      createdBy: data.createdBy
    }
  }

  getThreadsList() {
    this.groupedThreads = {};
    this.firstLoad = true;

    const threadQuery = query(this.getThreadCollection(), where('channelId', '==', this.currentChannelId));
    const unsubscribe = onSnapshot(threadQuery, list => {
      list.docChanges().forEach(change => {
        const threadData = this.setThreadObject(change.doc.id, change.doc.data());

        if (change.type === 'added') {
          this.addThreads(threadData);
        } else if (change.type === 'modified') {
          this.modifyThreads(threadData, change);
        } else if (change.type === 'removed') {
          this.removeThreads(change);
        }
      });

      if (this.firstLoad) {
        this.sortThreadByFirstMessageTimestamp();
        this.groupedThreads = this.groupThreadsByDate();
        this.firstLoad = false;
      }
      this.groupedChannelThreads.next(this.groupedThreads);
    });
  }

  addThreads(threadData: any) {
    const newThread = new Thread(threadData);
    this.allThreads.push(newThread);

    if (!this.firstLoad) {
      this.addThreadToGroup(newThread);
    }
  }

  modifyThreads(threadData: any, change: any) {
    const modifiedThreadIndex = this.allThreads.findIndex(thread => thread.threadId === change.doc.id);
    if (modifiedThreadIndex !== -1) {
      this.allThreads[modifiedThreadIndex] = new Thread(threadData);
      this.updateThreadInGroup(this.allThreads[modifiedThreadIndex]);
    }
  }

  removeThreads(change: any) {
    const removedThreadIndex = this.allThreads.findIndex(thread => thread.threadId === change.doc.id);
    if (removedThreadIndex !== -1) {
      const removedThread = this.allThreads.splice(removedThreadIndex, 1)[0];
      this.removeThreadFromGroup(removedThread);
    }
  }

  addThreadToGroup(thread: Thread) {
    const date = new Date(thread.timestamp).toISOString().split('T')[0]; // Format: YYYY-MM-DD
    if (!this.groupedThreads[date]) {
      this.groupedThreads[date] = [];
    }
    this.groupedThreads[date].push(thread);
  }

  updateThreadInGroup(thread: Thread) {
    const date = new Date(thread.timestamp).toISOString().split('T')[0];
    const group = this.groupedThreads[date];
    if (group) {
      const threadIndex = group.findIndex((t: Thread) => t.threadId === thread.threadId);
      if (threadIndex !== -1) {
        group[threadIndex] = thread;
      }
    }
  }

  removeThreadFromGroup(thread: Thread) {
    const date = new Date(thread.timestamp).toISOString().split('T')[0];
    const group = this.groupedThreads[date];

    if (group) {
      const threadIndex = group.findIndex((t: Thread) => t.threadId === thread.threadId);
      if (threadIndex !== -1) {
        group.splice(threadIndex, 1);
        if (group.length === 0) {
          delete this.groupedThreads[date];
        }
      }
    }
  }

  getThreadCollection() {
    return collection(this.firestore, 'threads');
  }

  setThreadObject(id: string, data: any): any {
    return {
      threadId: id,
      channelId: data.channelId,
      messages: data.messages,
      timestamp: data.timestamp
    }
  }

  sortThreadByFirstMessageTimestamp() {
    this.allThreads.sort((a, b) => a.timestamp - b.timestamp);
  }

  groupThreadsByDate(): { [key: string]: Thread[] } {
    return this.allThreads.reduce((groups, thread) => {
      const date = new Date(thread.timestamp).toISOString().split('T')[0]; // Format: YYYY-MM-DD
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(thread);
      return groups;
    }, {} as { [key: string]: Thread[] });
  }

  formatDateForDisplay(date: string): string {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    if (date === today) {
      return 'Heute';
    } else if (date === yesterday) {
      return 'Gestern';
    } else {
      const [year, month, day] = date.split('-');
      return `${day}.${month}.${year}`;
    }
    
  }


  getUserChatsList() {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(this.getUserChatsCollection(), list => {
        this.allUserChats = [];
        list.forEach(userChat => this.allUserChats.push(this.setUserChatObject(userChat.id, userChat.data())))
        observer.next(this.allUserChats);
      });
    });
  }

  getUserChatsCollection() {
    return collection(this.firestore, 'directMessages');
  }

  setUserChatObject(id: string, data: any): any {
    return {
      userChatId: id,
      participants: data.participants,
      messages: data.messages
    }
  }



  async addChannel(channel: Channel): Promise<string> {
    try {
      const docRef = await addDoc(this.getChannelCollection(), channel.toJSON());
      console.log("Document written with ID: ", docRef.id);
      return docRef.id;
    } catch (err) {
      console.error("Fehler beim Hinzufügen des Kanals: ", err);
      throw err;
    }
  }

  async addThread(thread: Thread) {
    await addDoc(this.getThreadCollection(), thread.toJSON()).catch((err) => {
      console.error(err)
    }).then((docRef) => {
      console.log("Document written with ID: ", docRef?.id)
    });
  }

  async addUserChat(userChat: UserChat) {
    await addDoc(this.getUserChatsCollection(), userChat.toJSON()).catch((err) => {
      console.error(err)
    }).then((docRef) => {
      console.log("Document written with ID: ", docRef?.id)
    });
  }

  async updateUser(user: User) {
    let docRef = this.getUserDocRef(user.id);
    await updateDoc(docRef, user.toJSON()).catch((err) => {
      console.error(err)
    });
  }

  getUserDocRef(userId: string) {
    return doc(collection(this.firestore, 'users'), userId);
  }


  async updateChannel(channel: Channel) {
    let docRef = this.getChannelDocRef(channel.channelId);
    await updateDoc(docRef, channel.toJSON()).catch((err) => {
      console.error(err)
    });
  }

  getChannelDocRef(channelId: string) {
    return doc(collection(this.firestore, 'channels'), channelId);
  }


  async updateThread(thread: Thread) {
    let docRef = this.getThreadDocRef(thread.threadId);
    await updateDoc(docRef, thread.toJSON()).catch((err) => {
      console.error(err)
    });
  }

  getThreadDocRef(threadId: string) {
    return doc(collection(this.firestore, 'threads'), threadId);
  }


  async updateUserChat(userChat: UserChat) {
    let docRef = this.getUserChatDocRef(userChat.userChatId);
    await updateDoc(docRef, userChat.toJSON()).catch((err) => {
      console.error(err)
    });
  }

  getUserChatDocRef(userChatId: string) {
    return doc(collection(this.firestore, 'directMessages'), userChatId)
  }

  async updateMessage(message: Message) {
    // Message suchen und updaten
  }



  async deleteUserChat(userChatId: string) {
    await deleteDoc(this.getUserChatDocRef(userChatId)).catch((err) => {
      console.error(err)
    });
  }

  async deleteThread(threadId: string) {
    await deleteDoc(this.getThreadDocRef(threadId)).catch((err) => {
      console.error(err)
    })
  }

  async deleteMessage(message: Message) {
    // Message suchen und löschen
  }


  openThread(threadElement: Thread) {
    console.log('threadElement', threadElement);
  }

  ngOnDestroy() {
    this.threadUnsubscribe();
  }

}


