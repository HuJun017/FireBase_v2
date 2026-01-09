// book-detail.ts - VERSIONE COMPLETA AGGIORNATA
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
  currentTimestamp = new Date();
  isDebugMode = false;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    console.log('🔥 BookDetail - ngOnInit START');
    
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
    
    setInterval(() => {
      this.currentTimestamp = new Date();
      this.cdr.markForCheck();
    }, 60000);
  }

  async loadBook(bookId: string): Promise<void> {
    console.log('🔥 loadBook chiamato con:', bookId);
    
    try {
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

  // ========== NUOVE FUNZIONI AGGIUNTE ==========

  getAvailabilityPercentage(): number {
    if (!this.book || !this.book.total_copies || this.book.total_copies === 0) {
      return 0;
    }
    return Math.round((this.book.available_copies / this.book.total_copies) * 100);
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    console.warn('🖼️ Immagine non caricata:', imgElement.src);
    imgElement.style.display = 'none';
    
    const parent = imgElement.parentElement;
    if (parent) {
      parent.innerHTML = `
        <div class="no-image-placeholder">
          <span>Immagine non disponibile</span>
        </div>
      `;
    }
  }

  reloadData(): void {
    console.log('🔄 Ricarico i dati del libro');
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.loading = true;
      this.error = null;
      this.book = null;
      this.cdr.markForCheck();
      
      setTimeout(() => {
        this.loadBook(bookId);
      }, 300);
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  isBookAvailable(): boolean {
    return this.book && this.book.available_copies > 0;
  }

  getFormattedCategory(): string {
    if (!this.book || !this.book.category) return 'N/A';
    const category = this.book.category;
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  }

  getFormattedYear(): string {
    if (!this.book || !this.book.year) return 'N/A';
    const year = this.book.year;
    if (year < 0) {
      return `${Math.abs(year)} a.C.`;
    }
    return year.toString();
  }

  goBack(): void {
    window.history.back();
  }

  toggleDebugMode(): void {
    this.isDebugMode = !this.isDebugMode;
    this.cdr.markForCheck();
    console.log('👨‍💼 Debug mode:', this.isDebugMode);
  }

  hasCompleteData(): boolean {
    if (!this.book) return false;
    const requiredFields = ['title', 'author', 'total_copies', 'available_copies'];
    return requiredFields.every(field => 
      this.book[field] !== undefined && this.book[field] !== null
    );
  }

  getAvailabilityColor(): string {
    const percentage = this.getAvailabilityPercentage();
    if (percentage === 0) return '#e74c3c';
    if (percentage < 30) return '#f39c12';
    if (percentage < 70) return '#f1c40f';
    return '#2ecc71';
  }

  isValidImageUrl(): boolean {
    if (!this.book || !this.book.image) return false;
    const url = this.book.image;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  borrowBook(): void {
    if (!this.isBookAvailable()) {
      alert('Non ci sono copie disponibili!');
      return;
    }
    
    this.book.available_copies--;
    console.log('📚 Libro prestato! Copie rimanenti:', this.book.available_copies);
    this.cdr.markForCheck();
    alert('Libro prenotato con successo!');
  }

  returnBook(): void {
    if (!this.book) return;
    
    if (this.book.available_copies >= this.book.total_copies) {
      alert('Tutte le copie sono già disponibili!');
      return;
    }
    
    this.book.available_copies++;
    console.log('📚 Libro restituito! Copie disponibili:', this.book.available_copies);
    this.cdr.markForCheck();
    alert('Libro restituito con successo!');
  }

  generateBookReport(): string {
    if (!this.book) return 'Nessun dato disponibile';
    
    return `
      REPORT LIBRO:
      ------------
      ID: ${this.book.id}
      Titolo: ${this.book.title}
      Autore: ${this.book.author}
      Categoria: ${this.getFormattedCategory()}
      Anno: ${this.getFormattedYear()}
      Disponibilità: ${this.book.available_copies}/${this.book.total_copies}
      Percentuale: ${this.getAvailabilityPercentage()}%
      Stato: ${this.isBookAvailable() ? 'Disponibile' : 'Esaurito'}
      Data generazione: ${this.formatDate(new Date())}
    `;
  }
}