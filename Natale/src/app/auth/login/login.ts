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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onLogin() {
    try {
      await this.authService.login(this.email(), this.password());
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.error.set(error.message);
    }
  }
}