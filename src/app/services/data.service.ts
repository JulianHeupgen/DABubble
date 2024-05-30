import {Injectable, inject} from '@angular/core';
import {Firestore, addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where} from '@angular/fire/firestore';
import {User} from '../models/user.class';
import {Channel} from '../models/channel.class';
import {Thread} from '../models/thread.class';
import {UserChat} from '../models/user-chat';
import {Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.getUsersList();
    this.getChannelsList();
    this.getThreadsList();
    this.getUserChatsList();
  }

  allUsers: User[] = [];
  allChannels: Channel[] = [];
  allThreads: Thread[] = [];
  allUserChats: UserChat[] = [];

  currentChannelId: string = 'Yk2dgejx9yy7iHLij1Qj'


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



  // getThreadsList() {
  //   return new Observable(observer => {
  //     const unsubscribe = onSnapshot(this.getThreadCollection(), list => {
  //       this.allThreads = [];
  //       list.forEach(thread => this.allThreads.push(this.setThreadObject(thread.id, thread.data())))
  //       observer.next(this.allThreads);
  //     });
  //   });

  // }

  // getThreadCollection() {
  //   return collection(this.firestore, 'threads');
  // }

  getThreadsList() {
    return new Observable<Thread[]>(observer => {
      const threadQuery = query(this.getThreadCollection(), where('channelId', '==', this.currentChannelId));
      const unsubscribe = onSnapshot(threadQuery, list => {
        this.allThreads = [];
        list.forEach(thread => this.allThreads.push(this.setThreadObject(thread.id, thread.data())));
        observer.next(this.allThreads);
      });
      return { unsubscribe };
    });
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


  openThread(threadElement: Thread) {
    console.log('threadElement', threadElement);
  }

}


