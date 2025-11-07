import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service'; // Importamos nuestro servicio

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; // Hay token, déjalo pasar
  } else {
    // No hay token, mándalo al login
    router.navigate(['/login']);
    return false;
  }
};