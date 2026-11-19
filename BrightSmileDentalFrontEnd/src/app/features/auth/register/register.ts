
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

import {
  AuthService,
  RegisterResponse
} from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  email = '';
  password = '';
  isSubmitting = false;

  /**
   * Register a new Patient account.
   *
   * Public registration does not allow
   * users to choose their own role.
   *
   * The ASP.NET Core backend assigns
   * the Patient role.
   */
  register(): void {

    // Prevent duplicate requests.
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

    this.authService.register(email, password).subscribe({

      next: (response: RegisterResponse) => {

        this.isSubmitting = false;

        const message =
          response.message ||
          'Registration successful. Please log in.';

        this.showMessage(message, 'success');

        // Redirect to login after registration.
        void this.router.navigate(['/login']);
      },

      error: (error: HttpErrorResponse) => {

        this.isSubmitting = false;

        console.error('Registration failed:', error);

        const message = this.getErrorMessage(error);

        this.showMessage(message, 'error');
      }
    });
  }

  /**
   * Basic email validation.
   */
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Convert backend HTTP errors into
   * user-friendly messages.
   */
  private getErrorMessage(
    error: HttpErrorResponse
  ): string {

    if (error.status === 0) {
      return 'Unable to connect to the server. Please try again.';
    }

    if (error.status === 409) {
      return 'An account with this email address already exists.';
    }

    if (error.status === 400) {

      const backendError: unknown = error.error;

      if (typeof backendError === 'string') {
        return backendError;
      }

      if (
        backendError &&
        typeof backendError === 'object' &&
        'message' in backendError &&
        typeof backendError.message === 'string'
      ) {
        return backendError.message;
      }

      return 'Invalid registration details. Please check your information.';
    }

    if (error.status >= 500) {
      return 'The server encountered an error. Please try again later.';
    }

    return 'Registration failed. Please try again.';
  }

  /**
   * Display registration feedback.
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
