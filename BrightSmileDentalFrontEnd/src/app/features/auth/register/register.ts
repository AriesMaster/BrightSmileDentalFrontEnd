
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
    MatSelectModule,
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

  // Retained for compatibility with the current HTML.
  // Public registration is always Patient-only.
  role = 'Patient';

  isSubmitting = false;

  register(): void {

    if (this.isSubmitting) {
      return;
    }

    const email = this.email.trim().toLowerCase();
    const password = this.password;

    if (!email || !password.trim()) {
      this.showMessage(
        'Please enter both email and password.',
        'error'
      );
      return;
    }

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

        this.showMessage(
          response.message ||
          'Registration successful. Please log in.',
          'success'
        );

        void this.router.navigate(['/login']);
      },

      error: (error: HttpErrorResponse) => {

        this.isSubmitting = false;

        console.error('Registration failed:', error);

        let message =
          'Registration failed. Please try again.';

        if (error.status === 0) {
          message =
            'Unable to connect to the server. Please try again.';
        } else if (error.status === 400) {
          const backendError = error.error;

          if (
            backendError &&
            typeof backendError === 'object' &&
            typeof backendError.message === 'string'
          ) {
            message = backendError.message;
          } else if (typeof backendError === 'string') {
            message = backendError;
          } else {
            message =
              'Invalid registration details. Please check your information.';
          }
        }

        this.showMessage(message, 'error');
      }
    });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

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
