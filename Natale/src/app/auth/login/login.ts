import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = signal('');
  password = signal('');
  error = signal('');
  successMessage = signal('');
  isLoading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onLogin() {
    if (!this.email() || !this.password()) {
      this.error.set('Per favore, compila tutti i campi richiesti.');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');
    this.successMessage.set('');

    try {
      await this.authService.login(this.email(), this.password());
      this.successMessage.set('Accesso effettuato con successo! Reindirizzamento in corso...');

      // Piccola pausa per mostrare il messaggio di successo
      setTimeout(() => {
        this.router.navigate(['/mesg']);
      }, 1500);

    } catch (error: any) {
      console.error('Errore durante il login:', error);

      // Gestione errori specifici
      if (error.code === 'auth/user-not-found') {
        this.error.set('Utente non trovato. Verifica l\'email inserita.');
      } else if (error.code === 'auth/wrong-password') {
        this.error.set('Password errata. Riprova.');
      } else if (error.code === 'auth/invalid-email') {
        this.error.set('Formato email non valido.');
      } else if (error.code === 'auth/user-disabled') {
        this.error.set('Questo account è stato disabilitato.');
      } else if (error.code === 'auth/too-many-requests') {
        this.error.set('Troppi tentativi di accesso. Riprova più tardi.');
      } else {
        this.error.set(error.message || 'Errore durante l\'accesso. Riprova.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  clearError() {
    this.error.set('');
  }

  clearSuccess() {
    this.successMessage.set('');
  }
}