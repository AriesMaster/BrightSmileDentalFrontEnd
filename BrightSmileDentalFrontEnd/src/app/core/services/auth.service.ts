
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

/**
 * Patient registration information.
 *
 * Matches the ASP.NET Core RegisterDto.
 */
export interface RegisterRequest {
  email: string;
  password: string;

  firstName: string;
  lastName: string;

  phoneNumber?: string;
  dateOfBirth?: string | null;
  gender?: string;
}

/**
 * Response returned after registration.
 */
export interface RegisterResponse {
  message: string;
}

/**
 * Authenticated user session.
 */
export interface AuthSession {
  token: string;
  email: string;
  role: UserRole;
}

/**
 * JWT payload fields used by the frontend.
 */
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

  private readonly apiUrl =
    `${environment.apiUrl}/Auth`;

  // Preserve existing storage keys.
  private readonly tokenKey = 'token';
  private readonly emailKey = 'email';
  private readonly roleKey = 'role';

  // ==========================================
  // REACTIVE SESSION STATE
  // ==========================================

  private readonly sessionState =
    signal<AuthSession | null>(
      this.restoreSession()
    );

  readonly session =
    this.sessionState.asReadonly();

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
   * Authenticates the user and stores
   * the returned JWT session.
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
   * Registers a Patient and sends their
   * personal information to the backend.
   *
   * The backend assigns the Patient role
   * and creates the associated Profile.
   */
  register(
    request: RegisterRequest
  ): Observable<RegisterResponse> {

    const payload: RegisterRequest = {
      email: request.email.trim().toLowerCase(),
      password: request.password,

      firstName: request.firstName.trim(),
      lastName: request.lastName.trim(),

      phoneNumber:
        request.phoneNumber?.trim() ?? '',

      dateOfBirth:
        request.dateOfBirth || null,

      gender:
        request.gender?.trim() ?? ''
    };

    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/register`,
      payload
    );
  }

  // ==========================================
  // SAVE SESSION
  // ==========================================

  private saveSession(
    response: LoginResponse
  ): void {

    const role = this.normalizeRole(
      response.role
    );

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

    localStorage.setItem(
      this.tokenKey,
      session.token
    );

    localStorage.setItem(
      this.emailKey,
      session.email
    );

    localStorage.setItem(
      this.roleKey,
      session.role
    );

    this.sessionState.set(session);
  }

  // ==========================================
  // RESTORE SESSION
  // ==========================================

  private restoreSession(): AuthSession | null {

    const token =
      localStorage.getItem(this.tokenKey);

    const email =
      localStorage.getItem(this.emailKey);

    const storedRole =
      localStorage.getItem(this.roleKey);

    if (!token || !email || !storedRole) {
      this.clearStoredSession();
      return null;
    }

    const role = this.normalizeRole(storedRole);

    if (
      !role ||
      !this.isTokenValid(token)
    ) {
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
   * Returns the current non-expired JWT.
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

    return session !== null &&
      roles.includes(session.role);
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  logout(): void {

    this.clearSession();

    void this.router.navigate(['/login']);
  }

  /**
   * Clears authentication without navigation.
   *
   * Used by HTTP interceptors when a session
   * is no longer valid.
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

  getDashboardRoute(
    role: UserRole
  ): string {

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
   * Returns the JWT expiration time
   * as a Unix timestamp in seconds.
   */
  getTokenExpiration(): number | null {

    const session = this.getCurrentUser();

    if (!session) {
      return null;
    }

    const payload = this.decodeJwtPayload(
      session.token
    );

    return typeof payload?.exp === 'number'
      ? payload.exp
      : null;
  }

  /**
   * Returns remaining session lifetime
   * in seconds.
   */
  getRemainingSessionSeconds(): number {

    const expiration =
      this.getTokenExpiration();

    if (expiration === null) {
      return 0;
    }

    const currentTime =
      Math.floor(Date.now() / 1000);

    return Math.max(
      0,
      expiration - currentTime
    );
  }

  // ==========================================
  // JWT VALIDATION
  // ==========================================

  /**
   * Checks JWT structure and expiration.
   *
   * This does not verify the signature.
   * Signature verification is performed
   * by ASP.NET Core.
   */
  private isTokenValid(
    token: string
  ): boolean {

    if (typeof token !== 'string') {
      return false;
    }

    const parts = token.split('.');

    if (parts.length !== 3) {
      return false;
    }

    const payload =
      this.decodeJwtPayload(token);

    if (
      !payload ||
      typeof payload.exp !== 'number'
    ) {
      return false;
    }

    const currentTime =
      Math.floor(Date.now() / 1000);

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

      const decoded =
        atob(paddedBase64);

      const parsed: unknown =
        JSON.parse(decoded);

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

    switch (
      role?.trim().toLowerCase()
    ) {

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
