import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

import { Firestore, addDoc, collection } from '@angular/fire/firestore';
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

  async createFirebaseUser(user: User) {
    const strUser = this.stringifyUser(user);
    try {
      await addDoc(collection(this.firestore, 'users'), strUser);
    } catch (error) {
      console.error('Error set the user on firebase: ', error);
    }
  }

  stringifyUser(user: User) {
    return {
      "name": user.name,
      "email": user.email,
      "onlineStatus": user.onlineStatus,
      "channels": user.channels,
      "userChats": user.userChats,
      "userId": user.userId,
      "imageUrl": user.imageUrl,
    }
  }

}
