
import {
  Injectable,
  computed,
  inject,
  signal
} from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, tap } from 'rxjs';

import { environment } from '../../../assets/environments/environment';
import { LoginResponse } from '../models/login';

// ==========================================
// AUTHENTICATION MODELS
// ==========================================

export type UserRole = 'Admin' | 'Dentist' | 'Patient';

export interface RegisterResponse {
  message: string;
}

export interface AuthSession {
  token: string;
  email: string;
  role: UserRole;
}

interface JwtPayload {
  exp?: unknown;
}

// ==========================================
// AUTHENTICATION SERVICE
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = `${environment.apiUrl}/Auth`;

  // Preserve existing storage keys for compatibility.
  private readonly tokenKey = 'token';
  private readonly emailKey = 'email';
  private readonly roleKey = 'role';

  // ==========================================
  // REACTIVE SESSION STATE
  // ==========================================

  private readonly sessionState = signal<AuthSession | null>(
    this.restoreSession()
  );

  readonly session = this.sessionState.asReadonly();

  readonly isAuthenticated = computed(
    () => this.sessionState() !== null
  );

  readonly currentUserEmail = computed(
    () => this.sessionState()?.email ?? null
  );

  readonly currentUserRole = computed(
    () => this.sessionState()?.role ?? null
  );

  // ==========================================
  // LOGIN
  // ==========================================

  /**
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
        email: email.trim().toLowerCase(),
        password
      }
    ).pipe(
      tap(response => this.saveSession(response))
    );
  }

  // ==========================================
  // PATIENT REGISTRATION
  // ==========================================

  /**
   * POST /api/Auth/register
   *
   * Public registration is restricted to Patients.
   * The backend independently enforces this rule.
   */
  register(
    email: string,
    password: string
  ): Observable<RegisterResponse> {

    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/register`,
      {
        email: email.trim().toLowerCase(),
        password,
        role: 'Patient'
      }
    );
  }

  // ==========================================
  // SAVE SESSION
  // ==========================================

  private saveSession(response: LoginResponse): void {

    const role = this.normalizeRole(response.role);

    if (!role) {
      throw new Error(
        'The server returned an unsupported user role.'
      );
    }

    if (
      !response.token ||
      !response.email ||
      !this.isTokenValid(response.token)
    ) {
      throw new Error(
        'The server returned an invalid authentication session.'
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

  // ==========================================
  // RESTORE SESSION
  // ==========================================

  private restoreSession(): AuthSession | null {

    const token = localStorage.getItem(this.tokenKey);
    const email = localStorage.getItem(this.emailKey);
    const storedRole = localStorage.getItem(this.roleKey);

    if (!token || !email || !storedRole) {
      this.clearStoredSession();
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

  // ==========================================
  // TOKEN ACCESS
  // ==========================================

  /**
   * Return a non-expired JWT.
   *
   * Expired tokens are removed from storage.
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

  // ==========================================
  // CURRENT USER
  // ==========================================

  getCurrentUser(): AuthSession | null {

    if (!this.getToken()) {
      return null;
    }

    return this.sessionState();
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  hasRole(role: UserRole): boolean {

    const session = this.getCurrentUser();

    return session?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {

    const session = this.getCurrentUser();

    return session !== null && roles.includes(session.role);
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {

    this.clearSession();

    void this.router.navigate(['/login']);
  }

  /**
   * Clear the session without navigating.
   *
   * Useful for handling API authentication
   * failures in the HTTP interceptor.
   */
  clearSession(): void {

    this.clearStoredSession();

    this.sessionState.set(null);
  }

  private clearStoredSession(): void {

    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.emailKey);
    localStorage.removeItem(this.roleKey);
  }

  // ==========================================
  // DASHBOARD NAVIGATION
  // ==========================================

  getDashboardRoute(role: UserRole): string {

    switch (role) {

      case 'Admin':
        return '/dashboard';

      case 'Dentist':
        return '/dentist/dashboard';

      case 'Patient':
        return '/patient/dashboard';
    }
  }

  navigateToDashboard(): void {

    const session = this.getCurrentUser();

    if (!session) {
      void this.router.navigate(['/login']);
      return;
    }

    void this.router.navigate([
      this.getDashboardRoute(session.role)
    ]);
  }

  // ==========================================
  // JWT EXPIRATION
  // ==========================================

  /**
   * Return the JWT expiration time
   * in Unix seconds.
   */
  getTokenExpiration(): number | null {

    const session = this.getCurrentUser();

    if (!session) {
      return null;
    }

    const payload = this.decodeJwtPayload(session.token);

    return typeof payload?.exp === 'number'
      ? payload.exp
      : null;
  }

  /**
   * Return remaining session lifetime
   * in seconds.
   */
  getRemainingSessionSeconds(): number {

    const expiration = this.getTokenExpiration();

    if (expiration === null) {
      return 0;
    }

    const currentTime = Math.floor(Date.now() / 1000);

    return Math.max(0, expiration - currentTime);
  }

  /**
   * Checks JWT structure and expiration.
   *
   * This does not verify the token's signature.
   * Signature and authorization checks are
   * enforced by ASP.NET Core.
   */
  private isTokenValid(token: string): boolean {

    if (typeof token !== 'string') {
      return false;
    }

    const parts = token.split('.');

    if (parts.length !== 3) {
      return false;
    }

    const payload = this.decodeJwtPayload(token);

    if (!payload || typeof payload.exp !== 'number') {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);

    return payload.exp > currentTime;
  }

  // ==========================================
  // JWT PAYLOAD DECODING
  // ==========================================

  private decodeJwtPayload(
    token: string
  ): JwtPayload | null {

    try {

      const parts = token.split('.');

      if (parts.length !== 3) {
        return null;
      }

      const encodedPayload = parts[1];

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

      return parsed as JwtPayload;

    } catch {
      return null;
    }
  }

  // ==========================================
  // ROLE NORMALIZATION
  // ==========================================

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
