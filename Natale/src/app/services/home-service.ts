import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, addDoc, doc, deleteDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})

export class HomeService {

  constructor( 
    private firestore: Firestore,
    private authService: AuthService,
  ) {}

// Ottieni la collezione "Library"
  private getBooksCollection() {
    return collection(this.firestore, 'Library');
  }

  // Recupera tutti i libri
  getBook(): Observable<any[]> {
    const colRef = this.getBooksCollection();
    return collectionData(colRef, { idField: 'id' }) as Observable<any[]>;
  }

  // Aggiungi un nuovo libro
  aggiungiLibro(books: any) {
    const colRef = this.getBooksCollection();
    return addDoc(colRef, books);
  }

  // Elimina un libro dato il suo ID
  eliminaLibro(id: string) {
    const docRef = doc(this.firestore, `books/${id}`);
    return deleteDoc(docRef);
  }

  // Ottieni i prestiti dell'utente
  getUserLoans(userId: string): Observable<any[]> {
    return new Observable(observer => {
      const loansCollection = collection(this.firestore, 'Prenotazioni');
      const q = query(loansCollection, where('userId', '==', userId));

      getDocs(q).then(snapshot => {
        const loans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        observer.next(loans);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }
}
