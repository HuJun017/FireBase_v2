import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-mesg',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mesg.html',
  styleUrl: './mesg.css',
})
export class Mesg {
  private authService = inject(AuthService);
  private router = inject(Router);

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  }
}
