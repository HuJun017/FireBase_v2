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

/*----- funzione per caricare i libri dal HomeService ----------*/
loadBooks(): void {
  this.homeService.getBook().subscribe({
    next: (data) => {
      console.log('Libri caricati correttamente');
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

}