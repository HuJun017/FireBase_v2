import { Injectable } from '@angular/core';
import { User, Auth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // BehaviorSubject che contiene l'utente corrente (User o null).
  // Serve per far sapere al resto dell'app se qualcuno è loggato.
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  // Observable che altri componenti possono "ascoltare".
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private auth: Auth) {
    // onAuthStateChanged ascolta i cambiamenti di login/logout.
    // Viene chiamato automaticamente quando un utente fa login, logout
    // o quando la pagina viene ricaricata e Firebase ripristina la sessione.
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  // Registrazione di un nuovo utente con email e password.
  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // Login di un utente esistente con email e password.
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // Logout dell'utente corrente.
  logout() {
    return signOut(this.auth);
  }

  // Metodo per ottenere l'utente corrente.
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}
