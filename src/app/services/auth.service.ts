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
  docSnapshots, arrayUnion
} from '@angular/fire/firestore';
import {User} from '../models/user.class';
import {Observable} from 'rxjs';
import {DataService} from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  AUTHUSER = getAuth();

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
   * @param email - The email address of the user.
   * @param password - The password for the user.
   * @returns A Promise that resolves with the user credentials.
   */
  async signUp(email: string, password: string) {
    try {
      return await createUserWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      throw error;
    }
  }

  /**
   * This function performs a sign-in using email and password.
   * @param email - The email address of the user.
   * @param password - The password for the user.
   * @returns A Promise that resolves with the user credentials.
   */
  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      await this.updateFirebaseUser({onlineStatus: 'online'})
      return userCredential;
    } catch (error) {
      // throw error;
      return false
    }
  }

  /**
   * This function performs a sign-in using Google authentication.
   */
  signInWidthGoogle() {
    const googleProvider = new GoogleAuthProvider();
    const googleAuth = getAuth();

    signInWithPopup(googleAuth, googleProvider)
      .then(userCredential => {
        const userQuery = query(this.dataService.getUserCollection(), where('authUserId', '==', userCredential.user.uid));
        getDocs(userQuery).then(querySnapshot => {
          if (!querySnapshot.empty) {
            // we do nothing if the user exists
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

  /**
   * This function sets user data for a Google authenticated user.
   * @param userData - The user data from Google authentication.
   * @returns An object with the user's data.
   */
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

  /**
   * Logout the currently logged-in user.
   * @returns A Promise that resolves to true if logout was successful, false otherwise.
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
   * Get the document ID of the currently authenticated user.
   * @returns A Promise that resolves with the document ID, or undefined if no user is authenticated.
   */
  async getDocIdFromAuthenticatedUser(): Promise<string | undefined> {
    try {
      const auth = this.auth.currentUser?.uid;
      if (auth) {
        return await this.getDocIdFromAuthUserId(auth);
      }
      return undefined;
    } catch (error) {
      console.error('Could not provide the doc Id. ', error);
      throw error;
    }
  }

  /**
   * Update the Firestore user object with the provided data.
   * @param updateData - An object containing the data to update.
   * @returns A Promise that resolves when the update is complete.
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

  async updateChannelParticipantsArray(userId: string, channelId: string) {
    const channelRef = doc(this.firestore, "channels", channelId);
    await updateDoc(channelRef, {
      participants: arrayUnion(userId)
    });
  }

  /**
   * Update the email address of the currently authenticated user.
   * @param newMail - The new email address.
   * @returns A Promise that resolves when the update is complete.
   */
  async updateAuthUserEmail(newMail: string): Promise<void> {
    if (!this.AUTHUSER.currentUser) {
      return Promise.reject('No user!');
    }

    return updateEmail(this.AUTHUSER.currentUser, newMail)
      .then(() => {
        console.log('E-Mail updated successfully.');
      })
      .catch((err) => {
        console.error('Error updating user email.', err);
      })
  }

  /**
   * Add a stream of data for all users in Firestore.
   * @returns An Observable that emits a list of all users.
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

      // Return a teardown logic function that will be called when
      // the Observable is unsubscribed
      subscriber.add(() => {
        unsubscribe();
      })
    });
  }

  /**
   * Get the document data of the currently authenticated user.
   * @returns A Promise that resolves with the user document data.
   */
  async getUserDoc() {
    const docId = await this.getDocIdFromAuthenticatedUser();
    const docRef = doc(this.firestore, "users", docId as string);
    const docSnap = await getDoc(docRef);
    return docSnap.data();
  }

  /**
   * Add a stream of the Firestore user data for the currently logged-in user.
   * @returns An Observable that emits the user data.
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
   * Checks if the user is authenticated.
   * @returns An Observable that emits true if the user is authenticated, false otherwise.
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
   * Re-authenticate the user for sensitive actions.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns A Promise that resolves when re-authentication is complete.
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
   * Ensure to re-authenticate the user with reAuthenticateUser() before calling this function.
   * @returns A Promise that resolves to true if the user was successfully deleted, false otherwise.
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
   * Deletes the Firestore document of the currently authenticated user.
   * @returns A Promise that resolves when the Firestore user document is deleted.
   */
  async removeFirestoreUser() {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No UID found for current user.');
    }

    const uid = user.uid; // this gets the auth id from the current logged user
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
   * Rolls back the user's email to the old email if any error occurs during the update.
   * @param currentUser - The current authenticated user.
   * @param oldEmail - The old email address.
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
   * Bundled function to update the user's email in Firebase Authentication and Firestore.
   * @param currentUser - The current authenticated user.
   * @param newMail - The new email address.
   */
  async updateEmailAllRefs(currentUser: any, newMail: string) {
    try {
      await updateEmail(currentUser, newMail); // updates email in auth
      await this.updateEmailUsingUID(newMail); // updates email in firestore db
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates the user's email in Firestore.
   * @param email - The new email address.
   */
  async updateEmailUsingUID(email: string) {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No UID found for current user.');
    }

    const uid = user.uid; // this gets the auth id from the current logged user
    const docId = await this.getDocIdFromAuthUserId(uid);
    if (!docId) {
      throw new Error('User not found by Auth ID.')
    }

    try {
      await this.updateFirebaseUser({'email': email});
    } catch (error) {
      console.error('Could not update email on the firestore user.', error);
      throw error;
    }
  }

  /**
   * Searches the users collection for a given UID.
   * @param uid - The Auth ID of the user to search for.
   * @returns A Promise that resolves with the document ID of the user.
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
   * Returns the UID of the currently authenticated user.
   * @returns A Promise that resolves with the user's UID or rejects if no user is authenticated.
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

  /**
   * Creates a new user document in Firestore.
   * @param user - The user object to create in Firestore.
   */
  async createFirebaseUser(user: User) {
    const strUser = this.stringifyUser(user);
    try {
      return await addDoc(collection(this.firestore, 'users'), strUser);
    } catch (error) {
      console.error('Error uploading user to firebase: ', error);
      throw error;
    }
  }

  /**
   * Converts a User object to a plain JavaScript object.
   * @param user - The user object to convert.
   * @returns A plain JavaScript object representing the user.
   */
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
