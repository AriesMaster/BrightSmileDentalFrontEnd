
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../core/models/login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  email = '';
  password = '';
  isSubmitting = false;

  /**
   * Authenticate the user.
   *
   * The AuthService handles:
   * - API communication
   * - JWT validation
   * - Session storage
   * - Authentication state
   */
  login(): void {

    // Prevent duplicate login requests.
    if (this.isSubmitting) {
      return;
    }

    const email = this.email.trim().toLowerCase();
    const password = this.password;

    // Validate required fields.
    if (!email || !password.trim()) {
      this.showMessage(
        'Please enter both email and password.',
        'error'
      );
      return;
    }

    // Validate email format.
    if (!this.isValidEmail(email)) {
      this.showMessage(
        'Please enter a valid email address.',
        'error'
      );
      return;
    }

    this.isSubmitting = true;

    this.authService.login(email, password).subscribe({

      next: (response: LoginResponse) => {

        this.isSubmitting = false;

        // AuthService already saves the session.
        // Do not duplicate localStorage operations.

        this.showMessage(
          `Welcome back, ${response.email}!`,
          'success'
        );

        // Navigate according to the authenticated role.
        this.authService.navigateToDashboard();
      },

      error: (error: HttpErrorResponse) => {

        this.isSubmitting = false;

        console.error('Login failed:', error);

        let message =
          'Unable to sign in. Please try again.';

        if (error.status === 0) {

          message =
            'Cannot connect to the server. Please check your connection and try again.';

        } else if (
          error.status === 400 ||
          error.status === 401
        ) {

          message =
            'Invalid email or password. Please try again.';

        } else if (error.status >= 500) {

          message =
            'The server is currently unavailable. Please try again later.';
        }

        this.showMessage(message, 'error');
      }
    });
  }

  /**
   * Basic email format validation.
   */
  private isValidEmail(email: string): boolean {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Display success or error feedback.
   */
  private showMessage(
    message: string,
    type: 'success' | 'error'
  ): void {

    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: type === 'success'
        ? ['snackbar-success']
        : ['snackbar-error']
    });
  }
}
