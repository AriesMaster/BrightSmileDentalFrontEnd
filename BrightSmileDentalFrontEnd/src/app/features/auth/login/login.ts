
import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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

// ==========================================
// DEMO ACCOUNT TYPES
// ==========================================

export type DemoRole =
  | 'Admin'
  | 'Dentist'
  | 'Patient';

export interface DemoAccount {
  role: DemoRole;
  email: string;
  password: string;
  description: string;
}

// ==========================================
// LOGIN COMPONENT
// ==========================================

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
export class LoginComponent implements OnInit {

  // ==========================================
  // DEPENDENCY INJECTION
  // ==========================================

  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  // ==========================================
  // LOGIN FORM
  // ==========================================

  email = '';
  password = '';

  isSubmitting = false;

  // ==========================================
  // DEMO ACCOUNTS
  // ==========================================

  readonly demoAccounts: DemoAccount[] = [

    {
      role: 'Admin',
      email: 'admin@brightsmile.com',
      password: 'Demo@1234',

      description:
        'Explore administrative features, user management and appointment workflows.'
    },

    {
      role: 'Dentist',
      email: 'dentist@brightsmile.com',
      password: 'Demo@1234',

      description:
        'Explore the dentist dashboard and appointment management features.'
    },

    {
      role: 'Patient',
      email: 'patient@brightsmile.com',
      password: 'Demo@1234',

      description:
        'Explore patient features and appointment booking.'
    }

  ];

  // ==========================================
  // SELECTED DEMO ACCOUNT
  // ==========================================

  selectedDemoRole: DemoRole | null = null;

  // ==========================================
  // WELCOME POPUP
  // ==========================================

  showWelcomeDialog = false;

  private readonly welcomeDismissedKey =
    'brightsmile-demo-welcome-dismissed';

  // ==========================================
  // INITIALIZATION
  // ==========================================

  ngOnInit(): void {

    // Display the popup once per browser
    // tab session.

    this.showWelcomeDialog =
      sessionStorage.getItem(
        this.welcomeDismissedKey
      ) !== 'true';

  }

  // ==========================================
  // SELECT DEMO ACCOUNT
  // ==========================================

  selectDemoAccount(role: DemoRole): void {

    if (this.isSubmitting) {
      return;
    }

    const account = this.demoAccounts.find(
      demo => demo.role === role
    );

    if (!account) {
      return;
    }

    // Store selected role.

    this.selectedDemoRole = account.role;

    // Automatically populate the login form.

    this.email = account.email;
    this.password = account.password;

    // Authentication is not bypassed.
    // The user must still click Sign In.

  }

  // ==========================================
  // CLEAR DEMO SELECTION
  // ==========================================

  clearDemoSelection(): void {

    if (this.isSubmitting) {
      return;
    }

    this.selectedDemoRole = null;

    this.email = '';
    this.password = '';

  }

  // ==========================================
  // DISMISS WELCOME POPUP
  // ==========================================

  dismissWelcomeDialog(): void {

    this.showWelcomeDialog = false;

    // Remember dismissal for this browser
    // tab session.

    sessionStorage.setItem(
      this.welcomeDismissedKey,
      'true'
    );

  }

  // ==========================================
  // REOPEN WELCOME POPUP
  // ==========================================

  openWelcomeDialog(): void {

    this.showWelcomeDialog = true;

  }

  // ==========================================
  // AUTHENTICATE USER
  // ==========================================

  login(): void {

    // Prevent duplicate requests.

    if (this.isSubmitting) {
      return;
    }

    const email = this.email.trim().toLowerCase();
    const password = this.password;

    // ========================================
    // REQUIRED FIELD VALIDATION
    // ========================================

    if (!email || !password.trim()) {

      this.showMessage(
        'Please enter both email and password.',
        'error'
      );

      return;
    }

    // ========================================
    // EMAIL VALIDATION
    // ========================================

    if (!this.isValidEmail(email)) {

      this.showMessage(
        'Please enter a valid email address.',
        'error'
      );

      return;
    }

    this.isSubmitting = true;

    // ========================================
    // AUTHENTICATION REQUEST
    // ========================================

    this.authService.login(
      email,
      password
    ).subscribe({

      next: (response: LoginResponse) => {

        this.isSubmitting = false;

        this.showMessage(
          `Welcome back, ${response.email}!`,
          'success'
        );

        // AuthService manages the JWT
        // and authenticated session.

        // Redirect according to the role
        // returned by the backend.

        this.authService.navigateToDashboard();

      },

      error: (error: HttpErrorResponse) => {

        this.isSubmitting = false;

        console.error(
          'Login failed:',
          error
        );

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

        this.showMessage(
          message,
          'error'
        );

      }

    });

  }

  // ==========================================
  // EMAIL FORMAT VALIDATION
  // ==========================================

  private isValidEmail(
    email: string
  ): boolean {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  }

  // ==========================================
  // SNACKBAR NOTIFICATIONS
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

        panelClass:
          type === 'success'
            ? ['snackbar-success']
            : ['snackbar-error']
      }
    );

  }

}
