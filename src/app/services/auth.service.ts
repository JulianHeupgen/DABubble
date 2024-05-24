import {Injectable} from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateEmail,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  signInWithCredential,
  signOut
} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {GoogleAuthProvider, getAuth, signInWithPopup} from "firebase/auth";

import {
  Firestore,
  doc,
  addDoc,
  collection,
  updateDoc,
  query,
  where,
  getDocs,
  getDoc,
  deleteDoc,
  onSnapshot,
  docSnapshots
} from '@angular/fire/firestore';
import {User} from '../models/user.class';
import {Observable} from 'rxjs';
import {DataService} from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private dataService: DataService,
    private router: Router,
  ) {
  }


  /* TEST SPACE */

  /* END TEST SPACE */


  /**
   * This function performs a signup using email and password.
   * @param email
   * @param password
   * @returns User Object to store data in firestore DB.
   */
  async signUp(email: string, password: string) {
    try {
      return await createUserWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      await this.updateFirebaseUser({onlineStatus: 'online'})
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
        const userQuery = query(this.dataService.getUserCollection(), where('authUserId', '==', userCredential.user.uid));
        getDocs(userQuery).then(querySnapshot => {
          if (!querySnapshot.empty) {
            //we do nothing if the user exists
          } else {
            const userData = this.setGoogleUserData(userCredential.user);
            const newUser = new User(userData);
            this.createFirebaseUser(newUser);
          }
          this.updateFirebaseUser({onlineStatus: 'online'})
          this.router.navigate(['/dashboard/']);
        }).catch((error) => {
          console.error('Error checking user existence:', error);
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  }

  setGoogleUserData(userData: any) {
    return {
      id: '',
      name: userData.displayName,
      email: userData.email,
      onlineStatus: 'offline' as 'offline',
      authUserId: userData.uid,
      imageUrl: userData.photoURL,
      channels: ['Yk2dgejx9yy7iHLij1Qj'],
      userChats: []
    }
  }

  // async setUserToFirestore(userData: any, name: string) {
  //   // let user = new User(
  //   //   name,
  //   //   userData.email,
  //   //   'offline',
  //   //   userData.uid,
  //   // )
  //   const docRef = await addDoc(collection(this.firestore, "users"), {
  //     'name': name,
  // 'email': userData.email,
  //     'onlineStatus': 'offline',
  //     'channels': [],
  //     'uid': userData.uid,
  //   });
  // }

  /**
   * Logout the actual logged-in user
   */
  async logout(): Promise<boolean> {
    try {
      await signOut(this.auth);
      return true;
    } catch (error) {
      console.error('Error logging out.');
      return false;
    }
  }

  /**
   * Get the docId from the actual logged User by the auth id
   * @returns firestore docId
   */
  async getDocIdFromAuthenticatedUser(): Promise<string | undefined> {
    try {
      const auth = this.auth.currentUser?.uid;
      if (auth) {
        return await this.getDocIdFromAuthUserId(auth);
      }
      return undefined;
    } catch (error) {
      console.error('Couldn t provide the doc Id. ', error);
      throw error;
    }
  }

  /**
   * This function can be used to update Firestore User Object.
   * The function extracts the logged authId.
   * @param updateData Update Object consisting key:value - Existing keys will be overwritten!
   */
  async updateFirebaseUser(updateData: { [key: string]: any }): Promise<void> {
    const docId = await this.getDocIdFromAuthenticatedUser();
    if (!docId) {
      console.error('No docId found for this user. Could not update the User Object.');
      return;
    }
    try {
      await updateDoc(doc(this.firestore, 'users', docId), updateData)
    } catch (error) {
      console.error('Error updating user online Status.', error);
      throw error;
    }
  }

  /**
   * Add a stream of data of all users in firestore
   * @returns List of all Users in firestore (not filtered)
   */
  getUsersList(): Observable<User[]> {
    return new Observable((subscriber) => {
      const q = query(collection(this.firestore, 'users'));
      const unsubscribe = onSnapshot(q, (qS) => {
        let arr: User[] = [];
        qS.forEach((doc) => {
          const user = doc.data() as User;
          arr.push(new User(user));
        });
        subscriber.next(arr);
      });

      //Return a teardown logic function that will be called when
      //the Observable is unsubscribed
      subscriber.add(() => {
        unsubscribe();
      })
    });
  }

  async getUserDoc() {
    const docId = await this.getDocIdFromAuthenticatedUser();
    const docRef = doc(this.firestore, "users", docId as string);
    const docSnap =  await getDoc(docRef);
    return docSnap.data();
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
        this.getDocIdFromAuthUserId(authId)
          .then(docId => {
            if (!docId) {
              subscriber.error(new Error('No doc ID found.'));
              return;
            }
            // Use the docId to get onSnapShot data
            const unsubscribe = onSnapshot(doc(this.firestore, 'users', docId), docSnapshots => {
              if (docSnapshots.exists()) {
                const user = new User(docSnapshots.data() as User);
                subscriber.next(user);
              } else {
                subscriber.error(new Error('Document does not exist.'));
              }
            }, error => {
              subscriber.error(error);
            });

            subscriber.add(() => {
              unsubscribe();
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
      // Cleanup logic
      subscriber.add(() => {
        unsubscribe();
      })
    });
  }

  /**
   * This reAuthenticates the user - for sensitive actions needed
   * @param email Email to log in
   * @param password Password to log in
   * @returns Boolean - true when successful
   */
  async reAuthenticateUser(email: string, password: string) {
    const user = this.auth.currentUser;
    const credential = EmailAuthProvider.credential(email, password);

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
    const docId = await this.getDocIdFromAuthUserId(uid);
    if (!docId) {
      throw new Error('User docId not found by Auth ID.')
    }

    try {
      await deleteDoc(doc(this.firestore, 'users', docId));
      console.log('Firestore User successfully deleted');
    } catch (error) {
      console.error('Could not delete firestore user.', error);
      throw error;
    }
  }

  /**
   * This is the main function to call when changing users full name.
   * @param name this is the new Full Name to update the User to
   */
  /*async updateName(name: string) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      throw new Error('Current user does not exist.');
    }

    const authId = currentUser.uid;
    const docId = await this.getDocIdFromAuthUserId(authId);
    if (!docId) {
      throw new Error('User docId not found by Auth ID.');
    }

    try {
      const userRef = doc(this.firestore, 'users', docId);
      await updateDoc(userRef, {'name': name});
    } catch (error) {
      console.error('Error updating user name to firestore. ', error);
      throw new Error('Failed to update Full Name.');
    }
  }*/

  /**
   * Updates email of the current user from Firebase Authentication and Firestore
   * Make sure to re-authenticate the user with reAuthenticateUser() before calling this function.
   * @returns newMail - true on success
   */
 /* async updateEmailAddress(newMail: string): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) {
      console.error('No user found.');
      return false;
    }
    const oldEmail = user.email as string;
    try {
      await this.updateEmailAllRefs(user, newMail);
      return true;
    } catch (error) {
      console.log('Error updating email, rolling back');
      await this.rollbackUser(user, oldEmail);
      throw new Error('Error while updating the email of the current user - rolled back.');
    }
  }*/

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
   * @param newMail
   */
  async updateEmailAllRefs(currentUser: any, newMail: string) {
    try {
      await updateEmail(currentUser, newMail); //updates email in auth
      await this.updateEmailUsingUID(newMail); //updates email in firestore db
    } catch (error) {
      throw error;
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
    const docId = await this.getDocIdFromAuthUserId(uid);
    if (!docId) {
      throw new Error('User not found by Auth ID.')
    }

    try {
      await this.setFirestoreUserEmail(docId, email);
    } catch (error) {
      console.error('Could not update email on the firestore user.', error);
      throw error;
    }
  }

  /**
   * Sets the users email in Firestore
   * @param docId
   * @param email
   */
  async setFirestoreUserEmail(docId: string, email: string) {
    const userRef = doc(this.firestore, 'users', docId);
    try {
      await updateDoc(userRef, {'email': email});
    } catch (error) {
      console.error('Error updating user email to this firestore. ', error);
      throw error;
    }
  }

  /**
   * Searches the users collection for a given uid
   * @param uid The Authid of the user to search for
   * @returns docId of the User doc with the given UID
   */
  async getDocIdFromAuthUserId(uid: string): Promise<string> {
    const usersRef = collection(this.firestore, "users");
    const q = query(usersRef, where("authUserId", "==", uid));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error('No firestore user document found for the provided UID.');
    }
    try {
      const userDoc = querySnapshot.docs[0];
      return userDoc.id;
    } catch (error) {
      throw new Error('Failed to retrieve document ID.');
    }
  }

  /**
   * This function returns the logged-in Users UID by Firebase Auth Object
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
        console.error('Failed to get Authentication state ', error);
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
