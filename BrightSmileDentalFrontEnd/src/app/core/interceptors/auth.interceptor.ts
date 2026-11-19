
import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { environment } from '../../../assets/environments/environment';

/**
 * BrightSmile Dental JWT Authentication Interceptor
 *
 * Responsibilities:
 * - Attach JWT tokens to backend API requests
 * - Avoid sending tokens to unrelated services
 * - Handle expired or rejected authentication
 * - Preserve public login and registration requests
 *
 * ASP.NET Core remains responsible for
 * JWT signature validation and authorization.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // ==========================================
  // CHECK API DESTINATION
  // ==========================================

  const apiBaseUrl = environment.apiUrl.replace(/\/+$/, '');

  const isApiRequest =
    req.url === apiBaseUrl ||
    req.url.startsWith(`${apiBaseUrl}/`);

  // Never attach authentication tokens
  // to requests outside our backend API.
  if (!isApiRequest) {
    return next(req);
  }

  // ==========================================
  // IDENTIFY PUBLIC AUTH ENDPOINTS
  // ==========================================

  const requestPath = req.url
    .slice(apiBaseUrl.length)
    .split('?')[0]
    .toLowerCase();

  const publicAuthPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password'
  ];

  const isPublicAuthRequest =
    publicAuthPaths.includes(requestPath);

  // ==========================================
  // ATTACH JWT
  // ==========================================

  const token = isPublicAuthRequest
    ? null
    : authService.getToken();

  const authenticatedRequest = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  // ==========================================
  // HANDLE HTTP RESPONSES
  // ==========================================

  return next(authenticatedRequest).pipe(

    catchError((error: unknown) => {

      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isPublicAuthRequest
      ) {

        // Only clear the session if this response
        // belongs to the token currently in use.
        // This avoids an older failed request
        // clearing a newer login session.
        const currentToken = authService.getToken();

        if (
          token &&
          currentToken === token
        ) {

          authService.clearSession();

          // Avoid redirecting repeatedly if the
          // user is already on the login page.
          if (!router.url.startsWith('/login')) {

            void router.navigate(
              ['/login'],
              {
                queryParams: {
                  returnUrl: router.url
                }
              }
            );
          }
        }
      }

      // Forward errors to the calling service
      // so components can display feedback.
      return throwError(() => error);
    })
  );
};
