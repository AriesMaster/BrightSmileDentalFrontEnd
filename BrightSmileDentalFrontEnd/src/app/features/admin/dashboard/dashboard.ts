
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/services/auth.service';

/**
 * BrightSmile Dental - Admin Dashboard
 *
 * Responsibilities:
 * - Display administrator account information
 * - Provide navigation to profile management
 * - Provide an overview of administrative features
 * - Handle administrator logout
 *
 * Future functionality:
 * - User management
 * - Dentist management
 * - Service management
 * - Appointment oversight
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,

  imports: [
    CommonModule,
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

  // ==========================================
  // AUTHENTICATED USER INFORMATION
  // ==========================================

  readonly email = this.authService.currentUserEmail;

  readonly role = this.authService.currentUserRole;

  // ==========================================
  // ADMIN DASHBOARD FEATURES
  // ==========================================

  readonly dashboardFeatures = [
    {
      title: 'User Management',
      description:
        'Manage registered patients, dentists and administrator accounts.',
      icon: 'manage_accounts',
      status: 'Coming Soon'
    },
    {
      title: 'Dentist Management',
      description:
        'Manage dental professionals and their account information.',
      icon: 'medical_services',
      status: 'Coming Soon'
    },
    {
      title: 'Dental Services',
      description:
        'Manage available dental treatments and service information.',
      icon: 'dentistry',
      status: 'Coming Soon'
    },
    {
      title: 'Appointment Management',
      description:
        'Monitor and manage appointments across the dental practice.',
      icon: 'event_note',
      status: 'Coming Soon'
    }
  ];

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  /**
   * Sign out the authenticated administrator.
   */
  logout(): void {
    this.authService.logout();
  }

}
