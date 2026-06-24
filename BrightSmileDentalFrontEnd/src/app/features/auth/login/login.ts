import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html'
})
export class LoginComponent {

  private authService = inject(AuthService);

  testLogin() {

    this.authService.login(
      'admin@brightsmile.com',
      'Password123!'
    ).subscribe({
      next: (response) => {
        console.log('SUCCESS');
        console.log(response);
      },
      error: (err) => {
        console.log('ERROR');
        console.log(err);
      }
    });
  }
}