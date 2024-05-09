import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateEmail, onAuthStateChanged, user } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

import { Firestore, doc, addDoc, collection, updateDoc, query, where, getDocs, getDoc } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { FirebaseError } from '@angular/fire/app';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
  ) { }

  async signUp(email: string, password: string, name: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      //this.setUserToFirestore(userCredential.user, name);
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  signInWidthGoogle() {
    const googleProvider = new GoogleAuthProvider();
    const googleAuth = getAuth();

    signInWithPopup(googleAuth, googleProvider)
      .then(userCredential => {
        console.log(userCredential.user);
        this.router.navigate(['/dashboard/', userCredential.user.uid]);
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  }

  async setUserToFirestore(userData: any, name: string) {
    // let user = new User(
    //   name,
    //   userData.email,
    //   'offline',
    //   userData.uid,
    // )
    const docRef = await addDoc(collection(this.firestore, "users"), {
      'name': name,
      'email': userData.email,
      'onlineStatus': 'offline',
      'channels': [],
      'uid': userData.uid,
    });
  }

  /**
   * This is the main function to call when changing email address.
   * @param newmail this is the new mail to update to
   */
  async updateName(name: string) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) { return }
    const authId = currentUser.uid;
    try {
      const docId = await this.getDocIdFromAuthUserId(authId);
      if (!docId) {
        console.log('No user found for given UID.');
        return;
      }
      const userRef = doc(this.firestore, 'users', docId);
      await updateDoc(userRef, { 'name': name });
    } catch (error) {
      console.error('Error updating user name to firestore. ', error);
    }
  }

  /**
   * This is the main function to call when changing email address.
   * @param newmail this is the new mail to update to
   */
  async updateEmailAddress(newmail: string) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) { return }
    const oldEmail = currentUser.email;
    if (!oldEmail) {
      throw new Error('Current user have no email set.');
    }
    try {
      await this.updateEmailAllRefs(currentUser, newmail);
    } catch (error) {
      await this.rollbackUser(currentUser, oldEmail, error);
    }
  }

  async rollbackUser(currentUser: any, oldEmail: string, error: any) {
    // Attempt to rollback
    try {
      await updateEmail(currentUser, oldEmail);
      console.warn('Reverted back to old email.');
    } catch (revertError) {
      console.error('Failed to revert email in Auth: ', revertError);
      throw new Error('An error happened when udpating email, and reverting it also failed. ');
    }
    throw error;
  }

  async updateEmailAllRefs(currentUser: any, newmail: string) {
    try {
      await updateEmail(currentUser, newmail);
      await this.updateFSUser(newmail);
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/requires-recent-login') {
        throw new Error('auth/requires-recent-login');
      } else {
        console.error('Failed to update email or Firestore due to:', error);
        throw error;
      }
    }
  }

  async updateFSUser(email: string) {
    const uid = this.auth.currentUser?.uid;
    if (!uid) {
      throw new Error('No UID found for current user.');
    }
    try {
      this.getIdFromUidAndUpdate(email, uid);
    } catch (error) {
      console.error('Couldnt update email on the firestore user.', error);
      throw error;
    }
  }

  async getIdFromUidAndUpdate(email: string, uid: string) {
    try {
      const docId = await this.getDocIdFromAuthUserId(uid);
      if (!docId) {
        console.log('No user found for given UID.');
        return;
      }
      const userRef = doc(this.firestore, 'users', docId);
      await updateDoc(userRef, { 'email': email });
    } catch (error) {
      console.error('Error updating user email to this.firestore. ', error);
    }
  }

  async getDocIdFromAuthUserId(uid: string) {
    const usersRef = collection(this.firestore, "users");
    const q = query(usersRef, where("authUserId", "==", uid));
    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.log('Snapshot empty.');
        return;
      }
      const userDoc = querySnapshot.docs[0];
      return userDoc.id;
    } catch (error) {
      console.error('Error updating user email to this.firestore. ', error);
      return null;
    }
  }

  /**
   * This function returns the logged in Users UID by Firebase Auth Object
   * @returns Logged in User UID or undefined if no User is authenticated
   */
  getUserAuthId() {
    return new Promise<string | null>((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        if (user) {
          resolve(user.uid);
        } else {
          reject(new Error('No user signed in.'));
        }
      }, (error) => {
        console.error('Failed to get authenticatin state ', error);
        reject(error);
      });
    })
  }

  /**
   * This function returns the logged in Users Email
   * @returns Logged in User Email address -> should change on email change
   */
  getUserEmail(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        if (user) {
          resolve(user.email);
        } else {
          reject(new Error('No user signed in.'));
        }
      }, (error) => {
        console.error('Failed to get authenticatin state ', error);
        reject(error);
      });
    })
  }

  /**
   * This function returns the fullnamer of the logged in user
   * @returns Logged in User' s Fullname or null if not found
   */
  async getUserFullname(uid: string) {
    const docId = await this.getDocIdFromAuthUserId(uid);
    if (!docId) {
      console.log('No such user found.');
      return;
    }
    const docRef = doc(this.firestore, "users", docId);
    const docSnap = await getDoc(docRef);
    if (docSnap) {
      const userData = docSnap.data();
      if (userData) {
        return userData['name'];
      }
    }
  }

  async createFirebaseUser(user: User) {
    const strUser = this.stringifyUser(user);
    try {
      await addDoc(collection(this.firestore, 'users'), strUser);
    } catch (error) {
      console.error('Error uploading user to firebase: ', error);
      throw new Error('Failed to create user in firebase.')
    }
  }

  stringifyUser(user: User) {
    return {
      "id": user.id,
      "name": user.name,
      "email": user.email,
      "onlineStatus": user.onlineStatus,
      "channels": user.channels,
      "userChats": user.userChats,
      "authUserId": user.authUserId,
      "imageUrl": user.imageUrl,
    }
  }

}
