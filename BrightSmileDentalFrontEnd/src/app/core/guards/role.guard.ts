
import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router
} from '@angular/router';

import {
  AuthService,
  UserRole
} from '../services/auth.service';

/**
 * Role-based authorization guard.
 *
 * Controls access to protected Angular routes
 * based on the authenticated user's role.
 *
 * Backend authorization remains the final
 * security enforcement layer.
 */
export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // Check authentication before checking roles.
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  // Read permitted roles from route configuration.
  const requiredRoles = route.data['roles'] as
    | string[]
    | string
    | undefined;

  // Routes without role restrictions are accessible
  // to any authenticated user.
  if (!requiredRoles) {
    return true;
  }

  const roles = Array.isArray(requiredRoles)
    ? requiredRoles
    : [requiredRoles];

  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    return router.createUrlTree(['/login']);
  }

  const hasPermission = roles.some(
    role =>
      role.toLowerCase() ===
      currentUser.role.toLowerCase()
  );

  if (hasPermission) {
    return true;
  }

  // Authenticated users with insufficient permissions
  // return to their own dashboard.
  return router.createUrlTree([
    authService.getDashboardRoute(currentUser.role)
  ]);
};
