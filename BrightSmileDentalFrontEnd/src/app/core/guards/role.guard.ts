import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as string[] | string | undefined;

  if (!requiredRoles) {
    return true;
  }

  const userRole = localStorage.getItem('role')?.toLowerCase();
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const allowed = roles.some((role) => role.toLowerCase() === userRole);

  if (allowed) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
