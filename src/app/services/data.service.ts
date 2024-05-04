import { Injectable, inject } from '@angular/core';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Channel } from '../models/channel.class';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  firestore: Firestore = inject(Firestore);

  allUsers: User[] = [];
  allChannels: Channel[] = [];


  getUsersList() {
    return onSnapshot(this.getCollection(), list => {
      this.allUsers = [];
      list.forEach(user =>  this.allUsers.push(this.setUserObject(user.id, user.data())))
    }
  )};
  
  getCollection() {
    return collection(this.firestore, 'users');
  }

  setUserObject(id: string, data: any): any {
    return {
      id: id,
      name: data.name,
      email: data.email,
      onlineStatus: data.onlineStatus,
      channels: data.channels
    }
  }

}


