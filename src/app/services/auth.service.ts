import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth: Auth,
    private firebase: Firestore,
    private router: Router,
  ) { }

  async signUp(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
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
      this.router.navigate(['/dashboard/',userCredential.user.uid]);
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  }

}
