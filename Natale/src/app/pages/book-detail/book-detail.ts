// book-detail.ts - VERSIONE CON DURATA PRENOTAZIONE 2 MESI
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Firestore, doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from '@angular/fire/firestore';
import { RouterModule } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './book-detail.html',
  styleUrls: ['./book-detail.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookDetail implements OnInit {
  book: any = null;
  loading = true;
  error: string | null = null;
  currentTimestamp = new Date();
  isDebugMode = false;
  bookPrenotato = false;
  showPrenotazioneAlert = false;
  currentUser: any = null;
  loadingPrenotazione = false;
  prenotazioneData: any = null;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private auth: Auth,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    // Ascolta i cambiamenti dell'utente autenticato
    user(this.auth).subscribe(async (user) => {
      this.currentUser = user;
      
      // Se c'è un utente loggato, controlla se ha già prenotato questo libro
      if (user && this.book) {
        await this.checkIfAlreadyPrenotato();
      }
      
      this.cdr.markForCheck();
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    const bookId = this.route.snapshot.paramMap.get('id');

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
    try {
      await new Promise(resolve => setTimeout(resolve, 50));

      const docRef = doc(this.firestore, 'Library', bookId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        this.book = {
          id: docSnap.id,
          title: data['title'],
          author: data['author'],
          category: data['category'],
          year: data['year'],
          ISBN: data['ISBN'],
          description: data['description'],
          total_copies: data['total_copies'],
          available_copies: data['available_copies'],
          image: data['image']
        };

        // Controlla se l'utente corrente ha già prenotato questo libro
        if (this.currentUser) {
          await this.checkIfAlreadyPrenotato();
        }
      } else {
        this.error = 'Documento non trovato';
      }
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;

      setTimeout(() => {
        this.cdr.markForCheck();
      }, 0);
    }
  }

  // Controlla se l'utente ha già prenotato questo libro
  async checkIfAlreadyPrenotato(): Promise<void> {
    if (!this.currentUser || !this.book) return;

    try {
      const prenotazioniRef = collection(this.firestore, 'Prenotazioni');
      const q = query(
        prenotazioniRef,
        where('bookId', '==', this.book.id),
        where('userId', '==', this.currentUser.uid),
        where('stato', 'in', ['pending', 'confermata'])
      );
      
      const querySnapshot = await getDocs(q);
      this.bookPrenotato = !querySnapshot.empty;
      
      // Se c'è una prenotazione, salva i dati
      if (!querySnapshot.empty) {
        const prenotazioneDoc = querySnapshot.docs[0];
        this.prenotazioneData = prenotazioneDoc.data();
      }
      
      this.cdr.markForCheck();
    } catch (error: any) {
      console.error('Errore nel controllo prenotazioni:', error);
    }
  }

  // ========== FUNZIONI ==========

  getAvailabilityPercentage(): number {
    if (!this.book || !this.book.total_copies || this.book.total_copies === 0) {
      return 0;
    }
    return Math.round((this.book.available_copies / this.book.total_copies) * 100);
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
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
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.loading = true;
      this.error = null;
      this.book = null;
      this.bookPrenotato = false;
      this.showPrenotazioneAlert = false;
      this.prenotazioneData = null;
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

  // Formatta la data per visualizzazione
  formatDateDisplay(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async prenotaLibro(): Promise<void> {
    if (!this.isBookAvailable() || this.bookPrenotato || !this.currentUser) {
      if (!this.currentUser) {
        alert('Devi effettuare il login per prenotare un libro!');
      }
      return;
    }

    this.loadingPrenotazione = true;
    this.cdr.markForCheck();

    try {
      // 1. Aggiorna il conteggio delle copie disponibili nel libro
      if (this.book.available_copies > 0) {
        this.book.available_copies--;
        
        // Salva nel database (Firestore)
        const bookRef = doc(this.firestore, 'Library', this.book.id);
        await updateDoc(bookRef, {
          available_copies: this.book.available_copies
        });

        // 2. Crea la prenotazione nel database (2 mesi = 60 giorni)
        const prenotazioniRef = collection(this.firestore, 'Prenotazioni');
        const now = new Date();
        const scadenza = new Date(now);
        scadenza.setMonth(scadenza.getMonth() + 2); // Aggiungi 2 mesi
        
        const prenotazioneDoc = await addDoc(prenotazioniRef, {
          bookId: this.book.id,
          bookTitle: this.book.title,
          userId: this.currentUser.uid,
          userEmail: this.currentUser.email,
          dataPrenotazione: now.toISOString(),
          stato: 'confermata',
          scadenza: scadenza.toISOString()
        });

        // 3. Imposta lo stato di prenotazione e salva i dati
        this.bookPrenotato = true;
        this.showPrenotazioneAlert = true;
        this.prenotazioneData = {
          dataPrenotazione: now.toISOString(),
          scadenza: scadenza.toISOString()
        };

      }
    } catch (error: any) {
      // Ripristina il contatore in caso di errore
      if (this.book) {
        this.book.available_copies++;
      }
      alert('Errore durante la prenotazione: ' + error.message);
    } finally {
      this.loadingPrenotazione = false;
      this.cdr.markForCheck();
    }
  }

  closeAlert(): void {
    this.showPrenotazioneAlert = false;
    this.cdr.markForCheck();
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
    try {
      new URL(this.book.image);
      return true;
    } catch {
      return false;
    }
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
      Prenotato: ${this.bookPrenotato ? 'Sì' : 'No'}
      Data generazione: ${this.formatDate(new Date())}
    `;
  }
}