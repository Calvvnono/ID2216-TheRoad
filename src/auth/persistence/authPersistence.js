import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../../shared/api/firebaseClient';
import { authStore } from '../model/authStore';

// Side effect: sync Firebase auth state into authStore.
// Anonymous users are treated as unauthenticated — they must sign in with email/password.
onAuthStateChanged(auth, (user) => {
  if (user && !user.isAnonymous) {
    authStore.setUser({ uid: user.uid, email: user.email });
  } else {
    authStore.setUser(null);
  }
});

export const authPersistence = {
  async signIn(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
  },

  async signUp(email, password) {
    await createUserWithEmailAndPassword(auth, email, password);
  },

  async signOut() {
    await firebaseSignOut(auth);
  },
};
