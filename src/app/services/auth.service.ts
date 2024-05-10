import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateEmail, onAuthStateChanged, user, EmailAuthProvider, reauthenticateWithCredential, deleteUser, signInWithCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

import { Firestore, doc, addDoc, collection, updateDoc, query, where, getDocs, getDoc, deleteDoc } from '@angular/fire/firestore';
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
   * This reauthenticates the user - for sensitive actions needed
   * @param email Email to log in
   * @param password Password to log in
   * @returns Boolean - true when successful
   */
  async reAuthenticateUser(email: string, password: string) {
    const user = this.auth.currentUser;
    const credential = await EmailAuthProvider.credential(email, password);

    if (!user || !credential) {
      console.error('Authentication failed. No User or credential.');
      return false;
    }

    try {
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      console.error('Re-authentication error: ', error);
      throw error;
    }
  }

  /**
   * Deletes the current user from Firebase Authentication.
   * Attention: Make sure to re-authenticate the user with reAuthenticateUser() before calling this function.
   * @returns Boolean - true on success
   */
  async removeAuthUser() {
    const user = this.auth.currentUser;
    if (!user) {
      console.error('User not found');
      return false;
    }
    try {
      await deleteUser(user);
      console.log('User Auth successfully deleted');
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  }

  /**
   * This function deletes the user document
   */
  async removeFirestoreUser() {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No UID found for current user.');
    }
    const uid = user.uid; //this gets the auth id from the current logged user
    try {
      const docId = await this.getDocIdFromAuthUserId(uid);
      if (!docId) {
        throw new Error ('User docId not found by Auth ID.')
      }
      await deleteDoc(doc(this.firestore, 'users', docId));
      console.log('User doc in Firestore successfully deleted');
    } catch (error) {
      console.error('Couldnt delete firestore user.', error);
      throw error;
    }
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
   * Updates email of the current user from Firebase Authentication and Firestore
   * Make sure to re-authenticate the user with reAuthenticateUser() before calling this function.
   * @returns Boolean - true on success
   */
  async updateEmailAddress(newmail: string): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) {
      console.error('No user found.');
      return false;
    }
    const oldEmail = user.email as string;
    try {
      await this.updateEmailAllRefs(user, newmail);
      return true;
    } catch (error) {
      console.log('Error updating email, rolling back');
      await this.rollbackUser(user, oldEmail);
      throw error;
    }
  }

  /**
   * Rollback function to set the old email if any resetting fails
   * @param currentUser
   * @param oldEmail
   */
  async rollbackUser(currentUser: any, oldEmail: string) {
    try {
      await updateEmail(currentUser, oldEmail);
      console.warn('Reverted back to old email.');
    } catch (revertError) {
      console.error('Failed to revert email in Auth: ', revertError);
      throw new Error('Critical failure. email update and rollback both failed!');
    }
  }

  /**
   * Bundled functions to update users email on auth and firestore
   * @param currentUser
   * @param newmail
   */
  async updateEmailAllRefs(currentUser: any, newmail: string) {
    try {
      await updateEmail(currentUser, newmail); //updates email in auth
      await this.updateEmailUsingUID(newmail); //updates email in firestore db
    } catch (error) {

    }
  }

  /**
   *
   * Gets the docId and calls the set method with the docid and the email
   * @param email Email to set in firestore
   */
  async updateEmailUsingUID(email: string) {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No UID found for current user.');
    }
    const uid = user.uid; //this gets the auth id from the current logged user
    try {
      const docId = await this.getDocIdFromAuthUserId(uid);
      if (!docId) {
        throw new Error ('User not found by Auth ID.')
      }
      await this.setFirestoreUserEmail(docId, email);
    } catch (error) {
      console.error('Couldnt update email on the firestore user.', error);
      throw error;
    }
  }

  /**
   * Sets the users email in Firestore
   * @param docId
   * @param email
   */
  async setFirestoreUserEmail(docId: string, email: string) {
    try {
      const userRef = doc(this.firestore, 'users', docId);
      await updateDoc(userRef, { 'email': email });
    } catch (error) {
      console.error('Error updating user email to this firestore. ', error);
      throw error;
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
   * This function returns the fullname of the logged in user
   * @returns String - Full Name of the user in firestore
   */
  async getUserFullname(uid: string) {
    const docId = await this.getDocIdFromAuthUserId(uid);
    if (!docId) {
      console.log('No doc found by Auth ID.');
      throw new Error ('No document exist with given Auth UID.');
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
      throw error;
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
