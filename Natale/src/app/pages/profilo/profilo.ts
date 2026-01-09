import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { HomeService } from '../../services/home-service';
import { RouterLink } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-profilo',
  imports: [CommonModule, RouterLink],
  templateUrl: './profilo.html',
  styleUrl: './profilo.css',
})
export class Profilo implements OnInit {
  userEmail: string = '';
  userLoans: any[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private homeService: HomeService,
    private firestore: Firestore,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userEmail = user.email || '';
        this.loadUserLoans(user.uid);
      } else {
        this.loading = false;
      }
    });
  }

  loadUserLoans(userId: string): void {
    this.homeService.getUserLoans(userId).subscribe({
      next: (loans) => {
        if (!loans || loans.length === 0) {
          this.userLoans = [];
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        // Processa i prestiti per ottenere i dettagli dei libri
        this.processLoansWithBookDetails(loans);
      },
      error: (err) => {
        console.error('Errore nel caricamento dei prestiti:', err);
        this.userLoans = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private async processLoansWithBookDetails(loans: any[]): Promise<void> {
    try {
      const loansWithDetails = await Promise.all(
        loans.map(loan => this.getLoanWithBookDetails(loan))
      );
      this.userLoans = loansWithDetails;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Errore nel processamento dei prestiti:', error);
      this.userLoans = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private async getLoanWithBookDetails(loan: any): Promise<any> {
    let bookTitle = loan.bookTitle || 'Titolo non disponibile';

    if (!loan.bookTitle && loan.bookId) {
      try {
        const bookDoc = await getDoc(doc(this.firestore, 'Library', loan.bookId));
        if (bookDoc.exists()) {
          const bookData = bookDoc.data();
          bookTitle = bookData['title'] || 'Titolo non disponibile';
        }
      } catch (error) {
        console.error('Errore nel recupero del libro:', error);
      }
    }

    const processedLoan = {
      ...loan,
      bookTitle,
      startDate: this.formatDate(loan.dataPrenotazione),
      endDate: this.formatDate(loan.scadenza),
      status: this.getStatusText(loan.stato)
    };

    return processedLoan;
  }

  private formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
  }

  private getStatusText(status: string): string {
    switch (status) {
      case 'confermata':
        return 'In prestito';
      case 'pending':
        return 'In attesa';
      case 'restituita':
        return 'Restituita';
      default:
        return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'In prestito':
        return 'bg-warning text-dark';
      case 'In attesa':
        return 'bg-info';
      case 'Restituita':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }
}
