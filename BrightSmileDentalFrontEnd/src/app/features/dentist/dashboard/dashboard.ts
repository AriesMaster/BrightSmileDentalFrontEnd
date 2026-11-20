
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dentist-dashboard',
  standalone: true,

  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],

  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {

  private readonly authService = inject(AuthService);

  /**
   * Sign out the currently authenticated dentist.
   */
  logout(): void {
    this.authService.logout();
  }

}
