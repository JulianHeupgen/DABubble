import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated().pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        return router.createUrlTree(['/login']);
      }
    })
  )

};

/**
 * Guard function to protect routes from unauthenticated access.
 * @param route - The activated route snapshot.
 * @param state - The router state snapshot.
 * @returns An observable that resolves to true if the user is authenticated, or redirects to the login page if not.
 */
