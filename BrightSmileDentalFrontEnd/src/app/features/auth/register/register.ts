import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  role = 'Patient';

  register() {
    const trimmedEmail = this.email.trim();
    const trimmedPassword = this.password.trim();
    const trimmedRole = this.role.trim();

    if (!trimmedEmail || !trimmedPassword) {
      alert('Please enter both email and password');
      return;
    }

    this.authService.register(trimmedEmail, trimmedPassword, trimmedRole).subscribe({
      next: () => {
        alert('Registration successful. Please log in.');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        alert('Registration failed. Please try again.');
      }
    });
  }
}
