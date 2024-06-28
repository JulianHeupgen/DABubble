import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Channel } from '../models/channel.class';
import { Thread } from '../models/thread.class';
import { UserChat } from '../models/user-chat';
import { BehaviorSubject, Observable } from 'rxjs';
import { Unsubscribe } from '@angular/fire/auth';
import { UserChatJson } from '../interfaces/user-chat-json.interface';


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

  groupedThreads: any = [];
  firstLoad: boolean = false;
  currentChannelId!: string;
  groupedChannelThreads: BehaviorSubject<{ [key: string]: { thread: Thread, index: number }[] }> = new BehaviorSubject({});
  private threadUnsubscribe: Unsubscribe | null = null;

  /**
   * Fetches the list of users from the Firestore database and updates the allUsers array.
   * Returns an observable that emits the updated list of users.
   * 
   * @returns {Observable<User[]>} - An observable emitting the list of users.
   */
  getUsersList() {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(this.getUserCollection(), list => {
        this.allUsers = [];
        list.forEach(user => this.allUsers.push(this.setUserObject(user.id, user.data())))
        observer.next(this.allUsers);
      });
    });
  }

  /**
   * Returns the Firestore collection reference for users.
   * 
   * @returns {CollectionReference} - Firestore collection reference for users.
   */
  getUserCollection() {
    return collection(this.firestore, 'users');
  }

  /**
   * Creates a user object from the provided data.
   * 
   * @param {string} id - The user ID.
   * @param {any} data - The user data.
   * @returns {User} - The user object.
   */
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

  /**
   * Fetches the list of channels from the Firestore database and updates the allChannels array.
   * Returns an observable that emits the updated list of channels.
   * 
   * @returns {Observable<Channel[]>} - An observable emitting the list of channels.
   */
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

  /**
   * Returns the Firestore collection reference for channels.
   * 
   * @returns {CollectionReference} - Firestore collection reference for channels.
   */
  getChannelCollection() {
    return collection(this.firestore, 'channels');
  }

  /**
   * Creates a channel object from the provided data.
   * 
   * @param {string} id - The channel ID.
   * @param {any} data - The channel data.
   * @returns {Channel} - The channel object.
   */
  setChannelObject(id: string, data: any): any {
    return {
      channelId: id,
      title: data.title,
      participants: data.participants,
      description: data.description,
      createdBy: data.createdBy
    }
  }

  /**
   * Fetches the images of participants in a given channel.
   * Returns an observable that emits an array of objects containing user IDs and their image URLs.
   * 
   * @param {string} channelId - The ID of the channel.
   * @returns {Observable<{userId: string, participantImage: string}[]>} - An observable emitting an array of participant images.
   */
  getParticipantImages(channelId: string) {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(doc(this.firestore, 'channels', channelId), async (channelSnapshot) => {
        if (channelSnapshot.exists()) {

          const participantsImages: any = [];

          this.allUsers.forEach((user: any) => {
            if (user.channels && user.channels.includes(channelId)) {
              participantsImages.push({
                userId: user.id,
                participantImage: user.imageUrl
              });
            }
          });
          observer.next(participantsImages);
        }
      });
      return () => unsubscribe();
    });
  }

  /**
   * Fetches the information of participants in a given channel.
   * Returns an observable that emits an array of user objects.
   * 
   * @param {string} channelId - The ID of the channel.
   * @returns {Observable<User[]>} - An observable emitting an array of participant information.
   */
  getParticipantInfos(channelId: string) {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(doc(this.firestore, 'channels', channelId), async (channelSnapshot) => {
        if (channelSnapshot.exists()) {
          const channelData = channelSnapshot.data();
          const channelParticipants = channelData['participants'];

          const participantsData: any = [];

          for (const userId of channelParticipants) {
            const userDoc = await getDoc(doc(this.firestore, 'users', userId));
            if (userDoc.exists()) {
              const user = this.setUserObject(userDoc.id, userDoc.data());
              if (user) {
                participantsData.push(user);
              }
            }
          }
          observer.next(participantsData);
        }
      });
      return () => unsubscribe();
    });
  }

  /**
   * Fetches the list of threads for the current channel and updates the internal state.
   * Listens for real-time updates from Firestore and handles added, modified, and removed threads.
   */
  getThreadsList() {
    this.groupedThreads = [];
    this.allThreads = [];
    this.firstLoad = true;

    if (this.threadUnsubscribe) {
      this.threadUnsubscribe();
      this.threadUnsubscribe = null;
    }

    const threadQuery = query(this.getThreadCollection(), where('channelId', '==', this.currentChannelId));
    this.threadUnsubscribe = onSnapshot(threadQuery, list => {
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
        this.groupedThreads = this.groupThreadsByDate(this.allThreads);
        this.firstLoad = false;
      }
      this.groupedChannelThreads.next(this.groupedThreads);
    });
  }

  /**
   * Adds a new thread to the list of all threads and updates the grouped threads if not the first load.
   * 
   * @param {any} threadData - The data of the thread to be added.
   */
  addThreads(threadData: any) {
    const newThread = new Thread(threadData);
    this.allThreads.push(newThread);

    if (!this.firstLoad) {
      const index = this.allThreads.length - 1;
      this.addThreadToGroup(newThread, index);
    }
  }

  /**
   * Modifies an existing thread in the list of all threads and updates the grouped threads.
   * 
   * @param {any} threadData - The data of the thread to be modified.
   * @param {any} change - The Firestore document change object.
   */
  modifyThreads(threadData: any, change: any) {
    const modifiedThreadIndex = this.allThreads.findIndex(thread => thread.threadId === change.doc.id);
    if (modifiedThreadIndex !== -1) {
      this.allThreads[modifiedThreadIndex] = new Thread(threadData);
      this.updateThreadInGroup(this.allThreads[modifiedThreadIndex]);
    }
  }

  /**
   * Removes a thread from the list of all threads and updates the grouped threads.
   * 
   * @param {any} change - The Firestore document change object.
   */
  removeThreads(change: any) {
    const removedThreadIndex = this.allThreads.findIndex(thread => thread.threadId === change.doc.id);
    if (removedThreadIndex !== -1) {
      const removedThread = this.allThreads.splice(removedThreadIndex, 1)[0];
      this.removeThreadFromGroup(removedThread);
    }
  }

  /**
   * Adds a thread to the grouped threads by date.
   * 
   * @param {Thread} thread - The thread to be added to the group.
   * @param {number} index - The index of the thread in the allThreads array.
   */
  addThreadToGroup(thread: Thread, index: number) {
    const date = new Date(thread.timestamp).toISOString().split('T')[0];
    if (!this.groupedThreads[date]) {
      this.groupedThreads[date] = [];
    }
    this.groupedThreads[date].push({ thread, index });
  }

  /**
   * Updates a thread in the grouped threads by date.
   * 
   * @param {Thread} thread - The thread to be updated in the group.
   */
  updateThreadInGroup(thread: Thread) {
    const date = new Date(thread.timestamp).toISOString().split('T')[0];
    const group = this.groupedThreads[date];
    if (group) {
      const threadIndex = group.findIndex((t: any) => t.thread.threadId === thread.threadId);
      if (threadIndex !== -1) {
        group[threadIndex].thread = thread;
      }
    }
  }

  /**
   * Removes a thread from the grouped threads by date.
   * 
   * @param {Thread} thread - The thread to be removed from the group.
   */
  removeThreadFromGroup(thread: Thread) {
    const date = new Date(thread.timestamp).toISOString().split('T')[0];
    const group = this.groupedThreads[date];

    if (group) {
      const threadIndex = group.findIndex((t: { thread: Thread, index: number }) => t.thread.threadId === thread.threadId);
      if (threadIndex !== -1) {
        group.splice(threadIndex, 1);
      }
    }
  }

  /**
   * Returns the Firestore collection reference for threads.
   * 
   * @returns {CollectionReference} - Firestore collection reference for threads.
   */
  getThreadCollection() {
    return collection(this.firestore, 'threads');
  }

  /**
   * Creates a thread object from the provided data.
   * 
   * @param {string} id - The thread ID.
   * @param {any} data - The thread data.
   * @returns {any} - The thread object.
   */
  setThreadObject(id: string, data: any): any {
    return {
      threadId: id,
      channelId: data.channelId,
      messages: data.messages,
      timestamp: data.timestamp
    }
  }

  /**
   * Sorts the list of all threads by the timestamp of their first message.
   */
  sortThreadByFirstMessageTimestamp() {
    this.allThreads.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Groups threads by their date.
   * 
   * @param {Thread[]} threads - The array of threads to be grouped.
   * @returns {{ [key: string]: { thread: Thread, index: number }[] }} - An object where keys are dates (YYYY-MM-DD) and 
   * values are arrays of thread objects with their indices.
   */
  groupThreadsByDate(threads: Thread[]): { [key: string]: { thread: Thread, index: number }[] } {
    const groupedThreads = threads.reduce((groups, thread, index) => {
      const date = new Date(thread.timestamp).toISOString().split('T')[0]; // Format: YYYY-MM-DD
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push({ thread, index });
      return groups;
    }, {} as { [key: string]: { thread: Thread, index: number }[] });
    const today = new Date().toISOString().split('T')[0];
    if (!groupedThreads[today]) {
      groupedThreads[today] = [];
    }

    return groupedThreads;
  }

  /**
   * Formats a date string for display.
   * 
   * @param {string} date - The date string in YYYY-MM-DD format.
   * @returns {string} - The formatted date string for display.
   */
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

  /**
   * Fetches the list of user chats and updates the internal state.
   * Returns an observable that emits the list of user chats.
   * 
   * @returns {Observable<UserChat[]>} - An observable emitting the list of user chats.
   */
  getUserChatsList(): Observable<UserChat[]> {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(this.getUserChatsCollection(), list => {
        this.allUserChats = [];
        list.forEach(userChat => this.allUserChats.push(this.setUserChatObject(userChat.id, userChat.data())))
        observer.next(this.allUserChats);
      });
    });
  }

  /**
   * Returns the Firestore collection reference for user chats.
   * 
   * @returns {CollectionReference} - Firestore collection reference for user chats.
   */
  getUserChatsCollection() {
    return collection(this.firestore, 'directMessages');
  }

  /**
   * Creates a user chat object from the provided data.
   * 
   * @param {string} id - The user chat ID.
   * @param {any} data - The user chat data.
   * @returns {any} - The user chat object.
   */
  setUserChatObject(id: string, data: any): any {
    return {
      userChatId: id,
      participants: data.participants,
      threads: data.threads
    }
  }

  /**
   * Fetches a specific user chat by ID and returns its threads.
   * Returns an observable that emits the threads of the user chat.
   * 
   * @param {string} userChatId - The ID of the user chat to fetch.
   * @returns {Observable<any[]>} - An observable emitting the threads of the user chat.
   */
  getUserChat(userChatId: string) {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(doc(this.firestore, 'directMessages', userChatId), userChat => {
        let userChatObject = new UserChat(this.setUserChatObject(userChat.id, userChat.data()));
        observer.next(userChatObject.threads);
      })
    })
  }

  /**
   * Adds a new channel to the Firestore collection and returns the document ID.
   * 
   * @param {Channel} channel - The channel object to be added.
   * @returns {Promise<string>} - A promise that resolves to the document ID of the added channel.
   * @throws {Error} - Throws an error if there is an issue adding the channel.
   */
  async addChannel(channel: Channel): Promise<string> {
    try {
      const docRef = await addDoc(this.getChannelCollection(), channel.toJSON());
      return docRef.id;
    } catch (err) {
      console.error("Fehler beim Hinzufügen des Kanals: ", err);
      throw err;
    }
  }

  /**
   * Adds a new thread to the Firestore collection.
   * Logs the document ID on successful addition or logs an error if the addition fails.
   * 
   * @param {Thread} thread - The thread object to be added.
   * @returns {Promise<void>} - A promise that resolves when the thread is added.
   */
  async addThread(thread: Thread) {
    await addDoc(this.getThreadCollection(), thread.toJSON()).catch((err) => {
      console.error(err)
    }).then( );
  }

  /**
   * Adds a new user chat to the Firestore collection.
   * Converts threads to string format before adding.
   * Logs the document ID on successful addition or logs an error if the addition fails.
   * 
   * @param {UserChat} userChat - The user chat object to be added.
   * @returns {Promise<void>} - A promise that resolves when the user chat is added.
   */
  async addUserChat(userChat: UserChat) {
    let userChatCopy = new UserChat(userChat.toJSON());
    let threadsAsString = userChatCopy.threads.map(thread => JSON.stringify(thread));
    let userChatJson = userChatCopy.toJSON() as UserChatJson;
    userChatJson.threads = threadsAsString;

    let userChatForFirebase: { [key: string]: any } = userChatJson;

    await addDoc(this.getUserChatsCollection(), userChatForFirebase).catch((err) => {
      console.error(err)
    }).then();
  }

  /**
   * Updates a user document in Firestore.
   *
   * @param {User} user - The user object to update.
   * @returns {Promise<void>} - A promise that resolves when the update is complete.
   */
  async updateUser(user: User) {
    let docRef = this.getUserDocRef(user.id);
    await updateDoc(docRef, user.toJSON()).catch((err) => {
      console.error(err)
    });
  }

   /**
   * Retrieves a reference to a user document in Firestore.
   *
   * @param {string} userId - The ID of the user.
   * @returns {DocumentReference} - The document reference.
   */
  getUserDocRef(userId: string) {
    return doc(collection(this.firestore, 'users'), userId);
  }

/**
   * Updates the userChats field of a user document in Firestore.
   *
   * @param {User} user - The user object.
   * @param {string} userChatId - The ID of the user chat to add.
   * @returns {Promise<void>} - A promise that resolves when the update is complete.
   */
  async updateUserChatsOfUser(user: User, userChatId: string) {
    let docRef = this.getUserDocRef(user.id);
    const newUserChat = {
      userChatId: userChatId
    };
    await updateDoc(docRef, {
      userChats: arrayUnion(newUserChat)
    });
  }

  /**
   * Updates a channel document in Firestore.
   *
   * @param {Channel} channel - The channel object to update.
   * @returns {Promise<void>} - A promise that resolves when the update is complete.
   */
  async updateChannel(channel: Channel) {
    let docRef = this.getChannelDocRef(channel.channelId);
    await updateDoc(docRef, channel.toJSON()).catch((err) => {
      console.error(err)
    });
  }

  /**
   * Retrieves a reference to a channel document in Firestore.
   *
   * @param {string} channelId - The ID of the channel.
   * @returns {DocumentReference} - The document reference.
   */
  getChannelDocRef(channelId: string) {
    return doc(collection(this.firestore, 'channels'), channelId);
  }

  /**
   * Updates a thread document in Firestore.
   *
   * @param {Thread} thread - The thread object to update.
   * @returns {Promise<void>} - A promise that resolves when the update is complete.
   */
  async updateThread(thread: Thread) {
    let docRef = this.getThreadDocRef(thread.threadId);
    await updateDoc(docRef, thread.toJSON()).catch((err) => {
      console.error(err)
    });
  }

  /**
   * Retrieves a reference to a thread document in Firestore.
   *
   * @param {string} threadId - The ID of the thread.
   * @returns {DocumentReference} - The document reference.
   */
  getThreadDocRef(threadId: string) {
    return doc(collection(this.firestore, 'threads'), threadId);
  }

   /**
   * Updates a user chat document in Firestore.
   *
   * @param {UserChat} userChat - The user chat object to update.
   * @returns {Promise<void>} - A promise that resolves when the update is complete.
   */
  async updateUserChat(userChat: UserChat) {
    let userChatCopy = new UserChat(userChat.toJSON());
    let threadsAsString = userChatCopy.threads.map(thread => JSON.stringify(thread));
    let userChatJson = userChatCopy.toJSON() as UserChatJson;
    userChatJson.threads = threadsAsString;

    let userChatForFirebase: { [key: string]: any } = userChatJson;

    let docRef = this.getUserChatDocRef(userChat.userChatId);

    await updateDoc(docRef, userChatForFirebase).catch((err) => {
      console.error(err)
    });
  }

   /**
   * Retrieves a reference to a user chat document in Firestore.
   *
   * @param {string} userChatId - The ID of the user chat.
   * @returns {DocumentReference} - The document reference.
   */
  getUserChatDocRef(userChatId: string) {
    return doc(collection(this.firestore, 'directMessages'), userChatId)
  }

  /**
   * Updates a specific thread in a user chat document in Firestore.
   *
   * @param {Thread} thread - The thread object to update.
   * @param {string | undefined} userChatId - The ID of the user chat.
   * @param {number | undefined} index - The index of the thread in the user chat.
   * @returns {Promise<void>} - A promise that resolves when the update is complete.
   */
  async updateUserChatThread(thread: Thread, userChatId: string | undefined, index: number | undefined) {
    if (userChatId !== undefined && index !== undefined) {
      try {
        let docRef = this.getUserChatDocRef(userChatId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          let currentThreads = docSnap.data()['threads'];
          currentThreads[index] = thread.toJSON();
          await updateDoc(docRef, { threads: currentThreads });
        } else {
          console.log("No such document!");
        }
      } catch (err) {
        console.error("Error updating document: ", err);
      }
    }
  }

  /**
   * Deletes a user chat document from Firestore.
   *
   * @param {string} userChatId - The ID of the user chat to delete.
   * @returns {Promise<void>} - A promise that resolves when the deletion is complete.
   */
  async deleteUserChat(userChatId: string) {
    await deleteDoc(this.getUserChatDocRef(userChatId)).catch((err) => {
      console.error(err)
    });
  }

  /**
   * Deletes a thread document from Firestore.
   *
   * @param {string} threadId - The ID of the thread to delete.
   * @returns {Promise<void>} - A promise that resolves when the deletion is complete.
   */
  async deleteThread(threadId: string) {
    await deleteDoc(this.getThreadDocRef(threadId)).catch((err) => {
      console.error(err)
    })
  }

  /**
   * Deletes a specific thread in a user chat document in Firestore.
   *
   * @param {string | undefined} userChatId - The ID of the user chat.
   * @param {number | undefined} index - The index of the thread in the user chat.
   * @returns {Promise<void>} - A promise that resolves when the deletion is complete.
   */
  async deleteUserChatThread(userChatId: string | undefined, index: number | undefined) {
    if (userChatId !== undefined && index !== undefined) {
      try {
        let docRef = this.getUserChatDocRef(userChatId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          let currentThreads = docSnap.data()['threads'];
          currentThreads.splice(index, 1);
          await updateDoc(docRef, { threads: currentThreads });
        } else {
          console.log("No such document!");
        }
      } catch (err) {
        console.error("Error deleting thread: ", err);
      }
    }
  }

  /**
   * Unsubscribes from the thread observable when the service is destroyed.
   */
  ngOnDestroy() {
    if (this.threadUnsubscribe) {
      this.threadUnsubscribe();
    }
  }

}

