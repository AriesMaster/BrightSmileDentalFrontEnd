
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, tap } from 'rxjs';

import { environment } from '../../../assets/environments/environment';
import { LoginResponse } from '../models/login';

/**
 * Supported application roles.
 *
 * Public registration always creates
 * a Patient account on the backend.
 */
export type UserRole = 'Admin' | 'Dentist' | 'Patient';

/**
 * Response returned by:
 * POST /api/Auth/register
 */
export interface RegisterResponse {
  message: string;
}

/**
 * Authentication session stored locally.
 */
export interface AuthSession {
  token: string;
  email: string;
  role: UserRole;
}

/**
 * BrightSmile Dental Authentication Service
 *
 * Responsibilities:
 * - Authenticate users
 * - Register patients
 * - Store and restore sessions
 * - Provide authentication state
 * - Handle logout
 * - Determine dashboard navigation
 *
 * Backend:
 * ASP.NET Core Web API
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = `${environment.apiUrl}/Auth`;

  private readonly tokenKey = 'token';
  private readonly emailKey = 'email';
  private readonly roleKey = 'role';

  /**
   * Internal authentication state.
   *
   * Signals allow components to react
   * automatically when the session changes.
   */
  private readonly sessionState = signal<AuthSession | null>(
    this.restoreSession()
  );

  /**
   * Read-only session state.
   */
  readonly session = this.sessionState.asReadonly();

  /**
   * Indicates whether a valid,
   * non-expired JWT is available.
   */
  readonly isAuthenticated = computed(
    () => this.sessionState() !== null
  );

  /**
   * Currently authenticated user's email.
   */
  readonly currentUserEmail = computed(
    () => this.sessionState()?.email ?? null
  );

  /**
   * Currently authenticated user's role.
   */
  readonly currentUserRole = computed(
    () => this.sessionState()?.role ?? null
  );

  // ==========================================
  // LOGIN
  // ==========================================

  /**
   * Authenticate using the existing API.
   *
   * POST /api/Auth/login
   *
   * The backend returns:
   * {
   *   token: string,
   *   email: string,
   *   role: string
   * }
   */
  login(
    email: string,
    password: string
  ): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      {
        email: email.trim(),
        password
      }
    ).pipe(
      tap(response => {
        this.saveSession(response);
      })
    );
  }

  // ==========================================
  // REGISTER
  // ==========================================

  /**
   * Register a new patient.
   *
   * POST /api/Auth/register
   *
   * The backend always assigns
   * the Patient role.
   *
   * The optional role parameter is retained
   * temporarily for compatibility with the
   * existing registration component.
   */
  register(
    email: string,
    password: string,
    role: string = 'Patient'
  ): Observable<RegisterResponse> {

    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/register`,
      {
        email: email.trim(),
        password,
        role: 'Patient'
      }
    );
  }

  // ==========================================
  // SESSION MANAGEMENT
  // ==========================================

  /**
   * Save authentication details after login.
   *
   * Storage keys are preserved for compatibility
   * with the existing interceptor and guards.
   */
  private saveSession(response: LoginResponse): void {

    const role = this.normalizeRole(response.role);

    if (!role) {
      throw new Error(
        'The server returned an unsupported user role.'
      );
    }

    if (!this.isTokenValid(response.token)) {
      throw new Error(
        'The server returned an invalid or expired authentication token.'
      );
    }

    const session: AuthSession = {
      token: response.token,
      email: response.email,
      role
    };

    localStorage.setItem(this.tokenKey, session.token);
    localStorage.setItem(this.emailKey, session.email);
    localStorage.setItem(this.roleKey, session.role);

    this.sessionState.set(session);
  }

  /**
   * Restore an existing session when
   * the Angular application starts.
   */
  private restoreSession(): AuthSession | null {

    const token = localStorage.getItem(this.tokenKey);
    const email = localStorage.getItem(this.emailKey);
    const storedRole = localStorage.getItem(this.roleKey);

    if (!token || !email || !storedRole) {
      return null;
    }

    const role = this.normalizeRole(storedRole);

    if (!role || !this.isTokenValid(token)) {
      this.clearStoredSession();
      return null;
    }

    return {
      token,
      email,
      role
    };
  }

  /**
   * Return the current JWT.
   *
   * If the token has expired,
   * clear the session automatically.
   */
  getToken(): string | null {

    const session = this.sessionState();

    if (!session) {
      return null;
    }

    if (!this.isTokenValid(session.token)) {
      this.clearSession();
      return null;
    }

    return session.token;
  }

  /**
   * Return the current authenticated user.
   */
  getCurrentUser(): AuthSession | null {

    const token = this.getToken();

    if (!token) {
      return null;
    }

    return this.sessionState();
  }

  /**
   * Check authentication status.
   */
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Check whether the authenticated user
   * has a required role.
   */
  hasRole(role: UserRole): boolean {

    const session = this.getCurrentUser();

    return session?.role === role;
  }

  /**
   * Check whether the authenticated user
   * has any of the specified roles.
   */
  hasAnyRole(roles: UserRole[]): boolean {

    const session = this.getCurrentUser();

    if (!session) {
      return false;
    }

    return roles.includes(session.role);
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  /**
   * Clear authentication state and
   * redirect to the login page.
   */
  logout(): void {

    this.clearSession();

    void this.router.navigate(['/login']);
  }

  /**
   * Clear the in-memory session
   * and local storage.
   */
  private clearSession(): void {

    this.clearStoredSession();

    this.sessionState.set(null);
  }

  /**
   * Remove persisted authentication data.
   */
  private clearStoredSession(): void {

    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.emailKey);
    localStorage.removeItem(this.roleKey);
  }

  // ==========================================
  // ROLE NAVIGATION
  // ==========================================

  /**
   * Return the dashboard route
   * associated with a user role.
   */
  getDashboardRoute(role: UserRole): string {

    switch (role) {

      case 'Admin':
        return '/dashboard';

      case 'Dentist':
        return '/dentist/dashboard';

      case 'Patient':
        return '/patient/dashboard';

      default:
        return '/login';
    }
  }

  /**
   * Redirect the authenticated user
   * to their role-specific dashboard.
   */
  navigateToDashboard(): void {

    const session = this.getCurrentUser();

    if (!session) {
      void this.router.navigate(['/login']);
      return;
    }

    const route = this.getDashboardRoute(session.role);

    void this.router.navigate([route]);
  }

  // ==========================================
  // JWT VALIDATION
  // ==========================================

  /**
   * Check whether a JWT has a valid
   * structure and has not expired.
   *
   * This is a client-side expiration check,
   * not cryptographic signature verification.
   *
   * The ASP.NET Core backend remains
   * responsible for JWT validation.
   */
  private isTokenValid(token: string): boolean {

    try {

      const parts = token.split('.');

      if (parts.length !== 3) {
        return false;
      }

      const payload = this.decodeJwtPayload(parts[1]);

      if (
        !payload ||
        typeof payload.exp !== 'number'
      ) {
        return false;
      }

      const currentTime = Math.floor(Date.now() / 1000);

      return payload.exp > currentTime;

    } catch {
      return false;
    }
  }

  /**
   * Decode a JWT payload using
   * Base64URL decoding.
   */
  private decodeJwtPayload(
    encodedPayload: string
  ): { exp?: unknown } | null {

    try {

      const base64 = encodedPayload
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const paddedBase64 = base64.padEnd(
        Math.ceil(base64.length / 4) * 4,
        '='
      );

      const decoded = atob(paddedBase64);

      const parsed: unknown = JSON.parse(decoded);

      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        return null;
      }

      return parsed as { exp?: unknown };

    } catch {
      return null;
    }
  }

  // ==========================================
  // ROLE NORMALIZATION
  // ==========================================

  /**
   * Convert backend role values
   * to supported application roles.
   */
  private normalizeRole(
    role: string | null | undefined
  ): UserRole | null {

    switch (role?.trim().toLowerCase()) {

      case 'admin':
        return 'Admin';

      case 'dentist':
        return 'Dentist';

      case 'patient':
        return 'Patient';

      default:
        return null;
    }
  }
}
