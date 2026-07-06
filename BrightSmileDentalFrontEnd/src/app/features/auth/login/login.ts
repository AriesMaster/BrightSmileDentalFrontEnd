import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../core/models/login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {

  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  email = '';
  password = '';
  isSubmitting = false;

  login() {
    const trimmedEmail = this.email.trim();
    const trimmedPassword = this.password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      this.showMessage('Please enter both email and password.', 'error');
      return;
    }

    this.isSubmitting = true;

    this.authService.login(trimmedEmail, trimmedPassword)
      .subscribe({
        next: (response: LoginResponse) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('email', response.email);
          localStorage.setItem('role', response.role);
          this.isSubmitting = false;
          this.showMessage(`Welcome back, ${response.email}!`, 'success');
          this.redirectAfterLogin(response.role);
        },

        error: (err) => {
          this.isSubmitting = false;
          console.error(err);
          this.showMessage('Invalid email or password. Please try again.', 'error');
        }
      });
  }

  private redirectAfterLogin(role: string) {
    const normalizedRole = role?.toLowerCase();

    if (normalizedRole === 'admin') {
      this.router.navigate(['/dashboard']);
      return;
    }

    if (normalizedRole === 'dentist') {
      this.router.navigate(['/dentist/dashboard']);
      return;
    }

    this.router.navigate(['/patient/dashboard']);
  }

  private showMessage(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? ['snackbar-success'] : ['snackbar-error']
    });
  }
}