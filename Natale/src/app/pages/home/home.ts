import { Component, OnInit} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeService } from '../../services/home-service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  book: any[] = [];
  filteredBooks: any[] = [];
  categories: string[] = [];
  loading = true;
  error = false;
  
  // Dati utente
  currentUser: any = null;
  userRole: string = '';

  /*----------Constructor-----------*/
  constructor(
    private homeService: HomeService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  /*------------------------*/

  ngOnInit(): void {
    this.loadUserData();
    this.loadBooks();
  }

  /*----- funzione per recuperare i dati dell'utente corrente ----------*/
  loadUserData(): void {
    this.homeService.getUsers().subscribe({
      next: (users) => {
        // Recupera l'email dell'utente loggato dal localStorage o authService
        const loggedUserEmail = this.authService.getUserEmail(); // o localStorage.getItem('userEmail')
        
        if (loggedUserEmail) {
          // Trova l'utente corrente nell'array di tutti gli utenti
          this.currentUser = users.find((user: any) => user.email === loggedUserEmail);
          
          if (this.currentUser) {
            this.userRole = this.currentUser.role || '';
            console.log('Utente corrente:', this.currentUser);
            console.log('Ruolo utente:', this.userRole);
          } else {
            console.warn('Utente non trovato nella lista');
          }
        } else {
          console.error('Email utente non disponibile');
        }
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore nel caricamento dati utente', err);
      }
    });
  }

  /*----- funzione per caricare i libri dal HomeService ----------*/
  loadBooks(): void {
    this.loading = true;
    this.error = false;
    this.homeService.getBook().subscribe({
      next: (data) => {
        console.log('Libri caricati correttamente');
        this.filteredBooks = data;
        this.categories = [...new Set(data.map((b: any) => b.category))].filter(c => c);
        this.book = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore nel caricamento dei libri', err);
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /*-------funzione di logout-------*/
  async onLogout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  }

  /*-------funzione per navigare alla pagina di aggiunta libro-------*/
  addNewBook() {
    this.router.navigate(['/new-book']);
  }

  selectedCategory: string = 'Tutti';

  // Questa funzione viene chiamata quando clicchi su una categoria
  filterByCategory(category: string) {
    this.selectedCategory = category;

    if (category === 'Tutti') {
      this.filteredBooks = this.book; // Mostra tutto
    } else {
      this.filteredBooks = this.book.filter(b => b.category === category);
    }
  }

  // Funzione per ottenere il conteggio dei libri per categoria
  getBooksCountByCategory(category: string): number {
    return this.book.filter(b => b.category === category).length;
  }

  // Funzione per ottenere il conteggio totale dei libri disponibili
  getAvailableBooksCount(): number {
    return this.book.reduce((total, book) => total + (book.available_copies || 0), 0);
  }

  // Funzione per ottimizzare il rendering della lista (trackBy)
  trackByBookId(index: number, book: any): any {
    return book.id;
  }

  /*-------funzione helper per verificare se l'utente è admin-------*/
  isAdmin(): boolean {
    return this.userRole === 'admin' || this.userRole === 'Admin';
  }


  // DA VERIFICARNE L'UTILITA
  /*-------funzione helper per verificare se l'utente è un normale user-------*/
  isUser(): boolean {
    return this.userRole === 'user' || this.userRole === 'User';
  }

}