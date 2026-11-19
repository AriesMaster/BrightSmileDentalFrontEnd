
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Authentication Guard
 *
 * Protects routes that require a valid
 * authentication session.
 *
 * JWT expiration is checked by AuthService.
 * The ASP.NET Core backend remains responsible
 * for validating JWT signatures and permissions.
 */
export const authGuard: CanActivateFn = (_route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  /**
   * Allow access when the user has
   * a non-expired authentication token.
   */
  if (authService.isLoggedIn()) {
    return true;
  }

  /**
   * Redirect unauthenticated users to login.
   *
   * Store the requested route in the URL
   * so the login component can optionally
   * redirect back after authentication.
   */
  return router.createUrlTree(
    ['/login'],
    {
      queryParams: {
        returnUrl: state.url
      }
    }
  );
};
