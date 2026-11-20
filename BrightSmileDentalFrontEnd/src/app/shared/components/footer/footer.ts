
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

/**
 * BrightSmile Dental - Shared Footer
 *
 * Responsibilities:
 * - Display practice branding
 * - Provide quick navigation links
 * - Display dental service information
 * - Support authenticated user navigation
 * - Display a dynamic copyright year
 *
 * Reusable across public and authenticated pages.
 */
@Component({
  selector: 'app-footer',
  standalone: true,

  imports: [
    RouterLink
  ],

  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent {

  // ==========================================
  // DEPENDENCY INJECTION
  // ==========================================

  private readonly authService = inject(AuthService);

  // ==========================================
  // COPYRIGHT
  // ==========================================

  readonly currentYear = new Date().getFullYear();

  // ==========================================
  // AUTHENTICATION STATE
  // ==========================================

  readonly currentUserRole =
    this.authService.currentUserRole;

  readonly isAuthenticated = computed(() => {
    return !!this.currentUserRole();
  });

  // ==========================================
  // ROLE-BASED NAVIGATION
  // ==========================================

  readonly isPatient = computed(() => {
    return this.currentUserRole() === 'Patient';
  });

  readonly dashboardRoute = computed(() => {

    const role = this.currentUserRole();

    if (!role) {
      return '/login';
    }

    return this.authService.getDashboardRoute(role);

  });

  // ==========================================
  // DENTAL SERVICES
  // ==========================================

  /**
   * Display-only service categories.
   *
   * These are illustrative labels, not a live
   * list retrieved from the backend.
   *
   * They will be replaced with actual services
   * once the services API is integrated.
   */
  readonly dentalServices = [
    'General Dentistry',
    'Teeth Cleaning',
    'Teeth Whitening',
    'Dental Checkups',
    'Cosmetic Dentistry'
  ];

}
