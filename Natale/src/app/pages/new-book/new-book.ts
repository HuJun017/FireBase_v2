import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewBookService } from '../../services/new-book-service';

@Component({
  selector: 'app-new-book',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-book.html',
  styleUrl: './new-book.css'
})
export class NewBook {
  
  newBook = {
    title: '',
    author: '',
    category: '',
    ISBN:'',
    year: null as number | null,
    description: '',
    image: '',
    available_copies: 1,
    total_copies: 1
  };

  showSuccessMessage = false;
  isSubmitting = false;
  imageError = false;

  categories = [
    'Romanzo',
    'Giallo',
    'Fantasy',
    'Fantascienza',
    'Horror',
    'Thriller',
    'Storico',
    'Biografico',
    'Saggio',
    'Poesia',
    'Teatro',
    'Avventura',
    'Rosa',
    'Distopico',
    'Altro'
  ];

  constructor(
    private newBookService: NewBookService,
    private router: Router
  ) {}

  // Verifica anteprima immagine
  onImageUrlChange() {
    this.imageError = false;
  }

  // Gestione errore immagine
  onImageError() {
    this.imageError = true;
  }

  // Sincronizza copie disponibili con totali
  onTotalCopiesChange() {
    if (this.newBook.available_copies > this.newBook.total_copies) {
      this.newBook.available_copies = this.newBook.total_copies;
    }
  }

  // Salva il libro
  async onSubmit() {
    // Validazione
    if (!this.newBook.title || !this.newBook.author) {
      alert('Titolo e Autore sono obbligatori!');
      return;
    }

    // Validazione copie
    if (this.newBook.available_copies > this.newBook.total_copies) {
      alert('Le copie disponibili non possono essere maggiori delle copie totali!');
      return;
    }

    this.isSubmitting = true;

    try {
      // Salva il libro su Firestore
      await this.newBookService.addBook(this.newBook);
      
      console.log('Libro salvato su Firestore:', this.newBook);
      
      // Mostra messaggio di successo
      this.showSuccessMessage = true;
      
      // Dopo 2 secondi torna alla home
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 2000);

    } catch (error) {
      console.error('Errore durante l\'aggiunta del libro:', error);
      alert('Errore durante l\'aggiunta del libro. Riprova.');
      this.isSubmitting = false;
    }
  }

  // Reset form
  resetForm() {
    this.newBook = {
      title: '',
      author: '',
      category: '',
      ISBN:'',
      year: null,
      description: '',
      image: '',
      available_copies: 1,
      total_copies: 1
    };
    this.imageError = false;
  }

  // Torna indietro
  goBack() {
    this.router.navigate(['/home']);
  }
}