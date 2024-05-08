import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail, updateEmail, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

import { Firestore, doc, addDoc, collection, updateDoc } from '@angular/fire/firestore';
import { User } from '../models/user.class';
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
  async updateEmailAddress(newmail: string) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) { return }
    const oldEmail = currentUser.email;
    if (!oldEmail) {
      throw new Error('Current user have no email set.');
    }
    try {
      this.updateEmailAllRefs(currentUser, newmail);
    } catch (error) {
      this.rollbackUser(currentUser, oldEmail, error);
    }
  }

  async rollbackUser(currentUser: any, oldEmail: string, error: any) {
    console.error('Error updating email, attempting to revert: ', error);
      // Attempt to rollback
      try {
        await updateEmail(currentUser, oldEmail);
        console.log('Reverted back to old email.');
      } catch (revertError) {
        console.error('Failed to revert email in Auth: ', revertError);
        throw new Error('An error happened when udpating email, and reverting it also failed. ');
      }
      throw new Error('An error happened when updating email, but the mail was reverted successfully.');
  }

  async updateEmailAllRefs(currentUser: any, newmail: string) {
    await updateEmail(currentUser, newmail);
      console.log('User updated in Auth');
      await this.updateFSUser(newmail);
      console.log('User updated in firestore');
  }

  async updateFSUser(email: string) {
    const uid = this.auth.currentUser?.uid;
    if (!uid) {
      throw new Error('No UID found for current user.');
    }
    try {
      const userRef = doc(this.firestore, "users", uid);
      await updateDoc(userRef, { 'email' : email });
    } catch (error) {
      console.error('Couldnt update email on the firestore user.', error);
      throw error;
    }
  }

  /**
   * This function returns the logged in Users UID by Firebase Auth Object
   * @returns Logged in User UID or undefined if no User is authenticated
   */
  getUserAuthId() {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        if (user) {
          resolve(user.uid);
        } else {
          console.log('No user signed in.');
          resolve(null);
        }
      }, reject);
    })
  }

  /**
   * This function returns the logged in Users Email
   * @returns Logged in User Email address -> should change on email change
   */
  getUserEmail(): Promise<string|null> {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        if (user) {
          resolve(user.email);
        } else {
          console.log('No user signed in.');
          resolve(null);
        }
      }, reject);
    })
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
