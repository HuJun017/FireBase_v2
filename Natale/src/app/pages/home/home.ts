import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

import { AuthService } from '../../services/auth-service';
import { HomeService } from '../../services/home-service';

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

  currentUser: any = null;
  userRole: boolean | null = null; // true = admin

  selectedCategory = 'Tutti';

  constructor(
    private homeService: HomeService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadBooks();
  }

  loadUserData(): void {
    this.homeService.getUsers().subscribe({
      next: (users) => {
        const email = this.authService.getUserEmail();
        if (!email) return;

        this.currentUser = users.find((u: any) => u.email === email);
        if (!this.currentUser) return;

        this.userRole = this.currentUser.role === true;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Errore caricamento utente', err)
    });
  }

  loadBooks(): void {
    this.loading = true;
    this.error = false;

    this.homeService.getBook().subscribe({
      next: (data) => {
        this.book = data;
        this.filteredBooks = data;
        this.categories = [...new Set(data.map((b: any) => b.category))].filter(Boolean);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore caricamento libri', err);
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  async onLogout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  addNewBook() {
    this.router.navigate(['/new-book']);
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.filteredBooks =
      category === 'Tutti'
        ? this.book
        : this.book.filter(b => b.category === category);
  }

  getBooksCountByCategory(category: string): number {
    return this.book.filter(b => b.category === category).length;
  }

  getAvailableBooksCount(): number {
    return this.book.reduce((tot, b) => tot + (b.available_copies || 0), 0);
  }

  trackByBookId(index: number, book: any): any {
    return book.id;
  }

  isAdmin(): boolean {
    return this.userRole === true;
  }
}
