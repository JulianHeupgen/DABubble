import { Injectable, inject } from '@angular/core';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Channel } from '../models/channel.class';
import { Thread } from '../models/thread.class';
import { UserChat } from '../models/user-chat';
import { Observable } from 'rxjs';

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


  // User von Firestore laden

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
      imageUrl: data.imageUrl
    }
  }


  // CHANNELS von Firestore laden

  getChannelsList() {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(this.getChannelCollection(), list => {
        this.allChannels = [];
        list.forEach(channel => this.allChannels.push(this.setChannelObject(channel.id, channel.data())))
        observer.next(this.allChannels); 
      });
    });
  }

  getChannelCollection() {
    return collection(this.firestore, 'channels');
  }

  setChannelObject(id: string, data: any): any {
    return {
      channelId: id,
      title: data.title,
      participants: data.participants,
      threads: data.threads
    }
  }


  // THREADS von Firestore laden

  getThreadsList() {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(this.getThreadCollection(), list => {
        this.allThreads = [];
        list.forEach(thread => this.allThreads.push(this.setThreadObject(thread.id, thread.data())))
        observer.next(this.allThreads); 
      });
    });
  }

  getThreadCollection() {
    return collection(this.firestore, 'threads');
  }

  setThreadObject(id: string, data: any): any {
    return {
      id: id,
      channelId: data.channelId,
      messages: data.messages,
      timestamp: data.timestamp
    }
  }


  // UserChats von Firestore laden

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
      id: id,
      participants: data.participants,
      messages: data.messages
    }
  }





  

  /* async addNote(item: Note) {
    await addDoc(this.getNotesRef(), item ).catch((err) => {
      console.error(err)
    }).then((docRef) => {
      console.log("Document written with ID: ", docRef?.id)
    });
  }

  





  // Daten aktualisieren: updateDoc() von Firebase benötigt ein docRef (das was geupdatet werden soll) und die neuen Daten 
  async updateNote(note: Note ) {
    if(note.id){
      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
      await updateDoc(docRef, this.getCleanJSON(note)).catch((err) => {
        console.error(err)
      });
    }
  }

  // richtige Collection 
  getColIdFromNote(note: Note) {
    if(note.type == 'note') {
      return 'notes'
    } else {
      return 'trash'
    }
  }

  // das Update
  getCleanJSON(note: Note):{} {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    }
  }

  // Document welches geändert werden soll 
  getSingleDocRef(colId: string, docId: string ) {
    return doc(collection(this.firestore, colId), docId);
  }






  // Einzelnes Document löschen
  async deleteNote(colId: string, docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch((err) => {
      console.error(err)
    });
  }

}
 */
  
}

