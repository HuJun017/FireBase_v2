import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeService, Book } from '../../services/home-service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  books: Book[] = [];
  loading = true;
  error = false;

  /*----------Constructor-----------*/
  constructor(
    private homeService: HomeService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  /*------------------------*/

  ngOnInit(): void {
    this.loadBooks();
  }
  
  /*-----funzione per caricare i libri----------*/
  loadBooks(): void {
    this.homeService.getBooks().subscribe({
      next: (data) => {
        console.log('dati passati')
        this.books = data;
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
  /*-------funzione per il noleggio del libro---------*/
  noleggiaLibro(book: any): void {
    this.homeService.rentBook(book.ID).subscribe({
      next: () => {
        this.loadBooks();
      },
      error: () => {
        alert('Libro non disponibile');
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

}