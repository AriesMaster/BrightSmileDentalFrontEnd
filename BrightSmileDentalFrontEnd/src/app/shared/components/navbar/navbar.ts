
import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

/**
 * BrightSmile Dental - Shared Navbar
 *
 * Responsibilities:
 * - Display public navigation links
 * - Display authenticated navigation links
 * - Support role-based dashboard navigation
 * - Provide patient appointment booking navigation
 * - Handle logout
 * - Manage responsive mobile navigation
 *
 * Supported roles:
 * - Admin
 * - Dentist
 * - Patient
 */
@Component({
  selector: 'app-navbar',
  standalone: true,

  imports: [
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {

  // ==========================================
  // DEPENDENCY INJECTION
  // ==========================================

  private readonly router = inject(Router);

  readonly authService = inject(AuthService);

  // ==========================================
  // NAVIGATION STATE
  // ==========================================

  readonly isMobileMenuOpen = signal(false);

  // ==========================================
  // AUTHENTICATED USER
  // ==========================================

  readonly currentUserEmail =
    this.authService.currentUserEmail;

  readonly currentUserRole =
    this.authService.currentUserRole;

  /**
   * Determine whether a user is authenticated.
   *
   * Authentication state is derived from the
   * existing AuthService signals.
   */
  readonly isAuthenticated = computed(() => {
    return !!this.currentUserRole();
  });

  // ==========================================
  // ROLE CHECKS
  // ==========================================

  readonly isAdmin = computed(() => {
    return this.currentUserRole() === 'Admin';
  });

  readonly isDentist = computed(() => {
    return this.currentUserRole() === 'Dentist';
  });

  readonly isPatient = computed(() => {
    return this.currentUserRole() === 'Patient';
  });

  // ==========================================
  // DASHBOARD ROUTING
  // ==========================================

  /**
   * Returns the appropriate dashboard route
   * for the authenticated user's role.
   */
  readonly dashboardRoute = computed(() => {

    const role = this.currentUserRole();

    if (!role) {
      return '/login';
    }

    return this.authService.getDashboardRoute(role);

  });

  // ==========================================
  // MOBILE MENU
  // ==========================================

  /**
   * Toggle mobile navigation visibility.
   */
  toggleMobileMenu(): void {

    this.isMobileMenuOpen.update(
      isOpen => !isOpen
    );

  }

  /**
   * Close the mobile navigation menu.
   */
  closeMobileMenu(): void {

    this.isMobileMenuOpen.set(false);

  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  /**
   * Log out the authenticated user.
   */
  logout(): void {

    this.closeMobileMenu();

    this.authService.logout();

  }

  // ==========================================
  // NAVIGATION HELPERS
  // ==========================================

  /**
   * Navigate to the user's dashboard.
   */
  navigateToDashboard(): void {

    this.closeMobileMenu();

    this.router.navigateByUrl(
      this.dashboardRoute()
    );

  }

  /**
   * Navigate to the profile page.
   */
  navigateToProfile(): void {

    this.closeMobileMenu();

    this.router.navigateByUrl('/profile');

  }

}
