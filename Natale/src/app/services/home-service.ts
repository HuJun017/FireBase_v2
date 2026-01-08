import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, addDoc, doc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
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
}
