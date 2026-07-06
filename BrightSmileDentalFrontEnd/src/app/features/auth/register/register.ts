import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  email = '';
  password = '';
  role = 'Patient';
  isSubmitting = false;

  register() {
    const trimmedEmail = this.email.trim();
    const trimmedPassword = this.password.trim();
    const trimmedRole = this.role.trim();

    if (!trimmedEmail || !trimmedPassword) {
      this.showMessage('Please enter both email and password.', 'error');
      return;
    }

    this.isSubmitting = true;

    this.authService.register(trimmedEmail, trimmedPassword, trimmedRole).subscribe({
      next: (message: string) => {
        this.isSubmitting = false;
        const successMessage = message || 'Registration successful. Please log in.';
        this.showMessage(successMessage, 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        const backendMessage = typeof err?.error === 'string'
          ? err.error
          : err?.message || 'Registration failed. Please try again.';
        this.showMessage(backendMessage, 'error');
      }
    });
  }

  private showMessage(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? ['snackbar-success'] : ['snackbar-error']
    });
  }
}
