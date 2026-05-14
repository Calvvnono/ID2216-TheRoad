import { makeAutoObservable } from 'mobx';

class AuthStore {
  currentUser = null; // { uid, email }
  authStatus = 'loading'; // 'loading' | 'authenticated' | 'unauthenticated'

  constructor() {
    makeAutoObservable(this);
  }

  setUser(user) {
    this.currentUser = user;
    this.authStatus = user ? 'authenticated' : 'unauthenticated';
  }
}

export const authStore = new AuthStore();
