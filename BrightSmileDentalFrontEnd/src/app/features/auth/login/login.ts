import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../core/models/login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';

  login() {
    const trimmedEmail = this.email.trim();
    const trimmedPassword = this.password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      alert('Please enter both email and password');
      return;
    }

    this.authService.login(trimmedEmail, trimmedPassword)
      .subscribe({
        next: (response: LoginResponse) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('email', response.email);
          localStorage.setItem('role', response.role);

          this.router.navigate(['/dashboard']);
        },

        error: (err) => {
          console.error(err);
          alert('Invalid email or password');
        }
      });
  }
}