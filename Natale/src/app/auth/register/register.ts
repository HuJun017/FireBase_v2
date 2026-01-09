import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  email = '';
  password = '';
  error = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onRegister() {
    if (!this.email || !this.password) {
      this.error = 'Compila tutti i campi richiesti';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.successMessage = '';

    try {
      await this.authService.register(this.email, this.password);
      this.successMessage = 'Account creato con successo! Reindirizzamento...';

      // Reindirizza dopo un breve delay per mostrare il messaggio di successo
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);

    } catch (error: any) {
      this.isLoading = false;
      this.error = this.getErrorMessage(error.code);
    }
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Questa email è già registrata. Prova ad accedere.';
      case 'auth/invalid-email':
        return 'Inserisci un indirizzo email valido.';
      case 'auth/weak-password':
        return 'La password è troppo debole. Usa almeno 6 caratteri.';
      case 'auth/network-request-failed':
        return 'Errore di connessione. Controlla la tua connessione internet.';
      default:
        return 'Errore durante la registrazione. Riprova.';
    }
  }

  clearError() {
    this.error = '';
  }

  clearSuccess() {
    this.successMessage = '';
  }
}