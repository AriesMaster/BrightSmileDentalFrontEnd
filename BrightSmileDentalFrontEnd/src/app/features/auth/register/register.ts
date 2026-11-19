
import {
  Component,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatFormFieldModule
} from '@angular/material/form-field';

import {
  MatInputModule
} from '@angular/material/input';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatSelectModule
} from '@angular/material/select';

import {
  MatDatepickerModule
} from '@angular/material/datepicker';

import {
  MatNativeDateModule
} from '@angular/material/core';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';

import {
  AuthService,
  RegisterRequest,
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
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule
  ],

  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {

  // ==========================================
  // DEPENDENCIES
  // ==========================================

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  private readonly snackBar =
    inject(MatSnackBar);

  // ==========================================
  // ACCOUNT INFORMATION
  // ==========================================

  email = '';
  password = '';

  // ==========================================
  // PERSONAL INFORMATION
  // ==========================================

  firstName = '';
  lastName = '';

  phoneNumber = '';

  dateOfBirth: Date | null = null;

  gender = '';

  // ==========================================
  // FORM STATE
  // ==========================================

  isSubmitting = false;

  hidePassword = true;

  readonly maxDate = new Date();

  readonly genders = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
    {
      value: 'Prefer not to say',
      label: 'Prefer not to say'
    }
  ];

  // ==========================================
  // REGISTER PATIENT
  // ==========================================

  /**
   * Registers a new patient account.
   *
   * The backend creates both:
   * 1. User
   * 2. Profile
   *
   * Public registration always assigns
   * the Patient role on the backend.
   */
  register(): void {

    // Prevent duplicate submissions.
    if (this.isSubmitting) {
      return;
    }

    // --------------------------------------
    // NORMALIZE INPUT
    // --------------------------------------

    const firstName =
      this.firstName.trim();

    const lastName =
      this.lastName.trim();

    const email =
      this.email.trim().toLowerCase();

    const password =
      this.password;

    const phoneNumber =
      this.phoneNumber.trim();

    const gender =
      this.gender.trim();

    // --------------------------------------
    // VALIDATE REQUIRED FIELDS
    // --------------------------------------

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password
    ) {
      this.showMessage(
        'Please complete all required fields.',
        'error'
      );

      return;
    }

    // --------------------------------------
    // VALIDATE FIRST NAME
    // --------------------------------------

    if (
      firstName.length < 2 ||
      firstName.length > 100
    ) {
      this.showMessage(
        'First name must contain between 2 and 100 characters.',
        'error'
      );

      return;
    }

    // --------------------------------------
    // VALIDATE LAST NAME
    // --------------------------------------

    if (
      lastName.length < 2 ||
      lastName.length > 100
    ) {
      this.showMessage(
        'Last name must contain between 2 and 100 characters.',
        'error'
      );

      return;
    }

    // --------------------------------------
    // VALIDATE EMAIL
    // --------------------------------------

    if (!this.isValidEmail(email)) {
      this.showMessage(
        'Please enter a valid email address.',
        'error'
      );

      return;
    }

    // --------------------------------------
    // VALIDATE PASSWORD
    // --------------------------------------

    if (password.length < 8) {
      this.showMessage(
        'Password must contain at least 8 characters.',
        'error'
      );

      return;
    }

    // --------------------------------------
    // VALIDATE PHONE NUMBER
    // --------------------------------------

    if (
      phoneNumber &&
      !this.isValidPhoneNumber(phoneNumber)
    ) {
      this.showMessage(
        'Please enter a valid phone number.',
        'error'
      );

      return;
    }

    // --------------------------------------
    // VALIDATE DATE OF BIRTH
    // --------------------------------------

    if (
      this.dateOfBirth &&
      (
        Number.isNaN(this.dateOfBirth.getTime()) ||
        this.dateOfBirth > this.maxDate
      )
    ) {
      this.showMessage(
        'Please enter a valid date of birth.',
        'error'
      );

      return;
    }

    // --------------------------------------
    // BUILD REGISTRATION REQUEST
    // --------------------------------------

    const request: RegisterRequest = {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,

      dateOfBirth: this.dateOfBirth
        ? this.formatDate(this.dateOfBirth)
        : null,

      gender
    };

    // --------------------------------------
    // SEND REGISTRATION REQUEST
    // --------------------------------------

    this.isSubmitting = true;

    this.authService
      .register(request)
      .subscribe({

        next: (
          response: RegisterResponse
        ) => {

          this.isSubmitting = false;

          const message =
            response.message ||
            'Registration successful. Please log in.';

          this.showMessage(
            message,
            'success'
          );

          // Redirect to login.
          void this.router.navigate([
            '/login'
          ]);
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.isSubmitting = false;

          console.error(
            'Patient registration failed:',
            error
          );

          const message =
            this.getErrorMessage(error);

          this.showMessage(
            message,
            'error'
          );
        }
      });
  }

  // ==========================================
  // PASSWORD VISIBILITY
  // ==========================================

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  // ==========================================
  // EMAIL VALIDATION
  // ==========================================

  private isValidEmail(
    email: string
  ): boolean {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    );
  }

  // ==========================================
  // PHONE VALIDATION
  // ==========================================

  /**
   * Accepts local and international
   * phone number formats.
   */
  private isValidPhoneNumber(
    phoneNumber: string
  ): boolean {

    const normalized = phoneNumber.replace(
      /[\s()-]/g,
      ''
    );

    return /^\+?\d{7,15}$/.test(
      normalized
    );
  }

  // ==========================================
  // DATE FORMATTING
  // ==========================================

  /**
   * Formats a selected date as YYYY-MM-DD.
   *
   * Uses local date components to avoid
   * timezone-related date shifts.
   */
  private formatDate(
    date: Date
  ): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // ==========================================
  // ERROR HANDLING
  // ==========================================

  private getErrorMessage(
    error: HttpErrorResponse
  ): string {

    // Connection failure.
    if (error.status === 0) {
      return 'Unable to connect to the server. Please try again.';
    }

    // Email already exists.
    if (error.status === 409) {
      return 'An account with this email address already exists.';
    }

    // Validation errors.
    if (error.status === 400) {

      const backendError: unknown =
        error.error;

      if (
        typeof backendError === 'string'
      ) {
        return backendError;
      }

      if (
        backendError &&
        typeof backendError === 'object'
      ) {

        if (
          'message' in backendError &&
          typeof backendError.message === 'string'
        ) {
          return backendError.message;
        }

        // ASP.NET Core validation problem details.
        if (
          'errors' in backendError &&
          backendError.errors &&
          typeof backendError.errors === 'object'
        ) {

          const validationErrors =
            Object.values(
              backendError.errors
            );

          const firstError =
            validationErrors
              .flatMap(value =>
                Array.isArray(value)
                  ? value
                  : []
              )
              .find(
                value =>
                  typeof value === 'string'
              );

          if (
            typeof firstError === 'string'
          ) {
            return firstError;
          }
        }
      }

      return 'Invalid registration details. Please check your information.';
    }

    // Server failure.
    if (error.status >= 500) {
      return 'The server encountered an error. Please try again later.';
    }

    return 'Registration failed. Please try again.';
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  private showMessage(
    message: string,
    type: 'success' | 'error'
  ): void {

    this.snackBar.open(
      message,
      'Close',
      {
        duration: 4000,

        horizontalPosition: 'center',
        verticalPosition: 'bottom',

        panelClass:
          type === 'success'
            ? ['snackbar-success']
            : ['snackbar-error']
      }
    );
  }
}
