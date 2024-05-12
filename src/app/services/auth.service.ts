import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateEmail, onAuthStateChanged, user, EmailAuthProvider, reauthenticateWithCredential, deleteUser, signInWithCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

import { Firestore, doc, addDoc, collection, updateDoc, query, where, getDocs, getDoc, deleteDoc, onSnapshot, docSnapshots } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
  ) { }

  /* TEST SPACE */

  async getDocIdfromAuthenticatedUser() {
    try {
      const auth = this.auth.currentUser?.uid;
      if (auth) {
        const docId = await this.getDocIdFromAuthUserId(auth);
        return docId;
      }
      return undefined;
    } catch (error) {
      console.error('Couldnt provide the doc Id. ', error);
      throw error;
    }
  }

  async updateUserOnlineStatus(newStatus: string) {
    try {
      const docId = await this.getDocIdfromAuthenticatedUser();
      if (!docId) {
        throw new Error('No docId found for this user.');
      }
      await updateDoc(doc(this.firestore, 'users', docId), {
        onlineStatus: newStatus
      })

    } catch (error) {
      console.error('Error updating user online Status.');
      throw error;
    }
  }


  /* END TEST SPACE */

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
   * Add a stream of data of all users in firestore
   * @returns List of all Users in firestore (not filtered)
   */
  getUsersList(): Observable<User[]> {
    return new Observable((subscriber) => {
      const q = query(collection(this.firestore, 'users'));
      onSnapshot(q, (qS) => {
        let arr: User[] = [];
        qS.forEach((doc) => {
          const user = doc.data() as User;
          arr.push(new User(user));
        });
        subscriber.next(arr);
      });
    });
  }

  /**
   * This function adds a stream of the firestore user data which is actually logged in
   * @returns User data
   */
  getUser(): Observable<any> {
    return new Observable(subscriber => {
      // First resolve the user auth id
      this.getUserAuthId().then(authId => {
        if (!authId) {
          subscriber.error(new Error('No auth id.'));
          return;
        }
        // Next resolve the docId by authId
        this.getDocIdFromAuthUserId(authId).then(docId => {
          if (!docId) {
            subscriber.error(new Error('No doc ID found.'));
            return;
          }
          // Use the docId to get onsnapShot data
          onSnapshot(doc(this.firestore, 'users', docId), docSnapshots => {
            if (docSnapshots.exists()) {
              const user = new User(docSnapshots.data() as User);
              subscriber.next(user);
            } else {
              subscriber.error(new Error('Document does not exist.'));
            }
          }, error => {
            subscriber.error(error);
          });
        }).catch(error => {
          subscriber.error(error);
        });
      }).catch(error => {
        subscriber.error(error);
      });
    });
  }

  /**
   * Checks if user is authenticated - Guard function
   * @returns Boolean if User is authenticated
   */
  isAuthenticated(): Observable<boolean> {
    return new Observable((subscriber) => {
      const unsubscribe = this.auth.onAuthStateChanged(user => {
        subscriber.next(!!user);
      }, err => {
        subscriber.error(err);
      });

      // Cleanup
      return unsubscribe;
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
      throw new Error('Authentication failed. User or Credentials wrong.');
    }

    try {
      await reauthenticateWithCredential(user, credential);
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
      console.log('Auth User successfully deleted');
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
        throw new Error('User docId not found by Auth ID.')
      }
      await deleteDoc(doc(this.firestore, 'users', docId));
      console.log('Firestore User successfully deleted');
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
      throw error;
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
        throw new Error('User not found by Auth ID.')
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

  async getDocIdFromAuthUserId(uid: string): Promise<string> {
    const usersRef = collection(this.firestore, "users");
    const q = query(usersRef, where("authUserId", "==", uid));
    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        throw new Error('No document found for the provided UID.');
      }
      const userDoc = querySnapshot.docs[0];
      return userDoc.id;
    } catch (error) {
      throw new Error('Failed to retrieve document ID.');
    }
  }

  /**
   * This function returns the logged in Users UID by Firebase Auth Object
   * @returns Logged in User UID or undefined if no User is authenticated
   */
  getUserAuthId() {
    return new Promise<string>((resolve, reject) => {
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
