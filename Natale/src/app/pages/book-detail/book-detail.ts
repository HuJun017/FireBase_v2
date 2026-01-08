// book-detail.ts - VERSIONE TEST
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './book-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookDetail implements OnInit {
  book: any = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    console.log('🔥 BookDetail - ngOnInit START');
    
    // FORZA UN DELAY per vedere se il problema è di timing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const bookId = this.route.snapshot.paramMap.get('id');
    console.log('🔥 Book ID:', bookId);
    
    if (!bookId) {
      this.error = 'Nessun ID fornito';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }
    
    await this.loadBook(bookId);
  }

  async loadBook(bookId: string): Promise<void> {
    console.log('🔥 loadBook chiamato con:', bookId);
    
    try {
      // FORZA UN ALTRO DELAY
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const docRef = doc(this.firestore, 'Library', bookId);
      const docSnap = await getDoc(docRef);
      
      console.log('🔥 Documento esiste?', docSnap.exists());
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('🔥 Dati grezzi:', data);
        
        this.book = { 
          id: docSnap.id, 
          title: data['title'],
          author: data['author'],
          category: data['category'],
          year: data['year'],
          description: data['description'],
          total_copies: data['total_copies'],
          available_copies: data['available_copies'],
          image: data['image']
        };
        
        console.log('🔥 Book object creato:', this.book);
        console.log('🔥 Tipo di book:', typeof this.book);
      } else {
        this.error = 'Documento non trovato';
        console.error('🔥 Documento NON trovato');
      }
    } catch (error: any) {
      console.error('🔥 Errore catch:', error);
      this.error = error.message;
    } finally {
      console.log('🔥 FINALLY - loading false');
      this.loading = false;
      
      // FORZA IL CHANGE DETECTION
      setTimeout(() => {
        console.log('🔥 Forzo change detection');
        this.cdr.markForCheck();
        console.log('🔥 Stato finale:', { 
          loading: this.loading, 
          error: this.error, 
          hasBook: !!this.book,
          bookTitle: this.book?.title 
        });
      }, 0);
    }
  }
}