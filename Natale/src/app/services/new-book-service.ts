import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, addDoc, doc, updateDoc, deleteDoc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NewBookService {

  constructor(private firestore: Firestore) {}

  // Ottieni la collezione "Library"
  private getBooksCollection() {
    return collection(this.firestore, 'Library');
  }

  // Recupera tutti i libri
  getAllBooks(): Observable<any[]> {
    const colRef = this.getBooksCollection();
    return collectionData(colRef, { idField: 'id' }) as Observable<any[]>;
  }

  // Recupera un singolo libro per ID
  async getBookById(id: string): Promise<any> {
    const docRef = doc(this.firestore, `Library/${id}`);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Libro non trovato');
    }
  }

  // Aggiungi un nuovo libro
  async addBook(bookData: any): Promise<void> {
    const colRef = this.getBooksCollection();
    
    // Validazione dati
    if (!bookData.title || !bookData.author) {
      throw new Error('Titolo e Autore sono campi obbligatori');
    }

    // Prepara i dati per Firestore
    const newBook = {
      title: bookData.title,
      author: bookData.author,
      category: bookData.category || '',
      year: bookData.year || null,
      description: bookData.description || '',
      image: bookData.image || '',
      ISBN: bookData.ISBN,
      total_copies: bookData.total_copies || 0,
      available_copies: bookData.available_copies || 0,
      created_at: new Date(),
      updated_at: new Date()
    };

    try {
      await addDoc(colRef, newBook);
      console.log('Libro aggiunto con successo a Firestore');
    } catch (error) {
      console.error('Errore durante l\'aggiunta del libro:', error);
      throw error;
    }
  }

  // Aggiorna un libro esistente
  async updateBook(id: string, bookData: any): Promise<void> {
    const docRef = doc(this.firestore, `Library/${id}`);
    
    try {
      const updateData = {
        ...bookData,
        updated_at: new Date()
      };
      
      await updateDoc(docRef, updateData);
      console.log('Libro aggiornato con successo');
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del libro:', error);
      throw error;
    }
  }

  // Elimina un libro
  async deleteBook(id: string): Promise<void> {
    const docRef = doc(this.firestore, `Library/${id}`);
    
    try {
      await deleteDoc(docRef);
      console.log('Libro eliminato con successo');
    } catch (error) {
      console.error('Errore durante l\'eliminazione del libro:', error);
      throw error;
    }
  }

  // Aggiorna solo il numero di copie disponibili (per prestiti/restituzioni)
  async updateAvailableCopies(id: string, copies: number): Promise<void> {
    const docRef = doc(this.firestore, `Library/${id}`);
    
    try {
      await updateDoc(docRef, {
        available_copies: copies,
        updated_at: new Date()
      });
      console.log('Copie disponibili aggiornate');
    } catch (error) {
      console.error('Errore durante l\'aggiornamento delle copie:', error);
      throw error;
    }
  }
}