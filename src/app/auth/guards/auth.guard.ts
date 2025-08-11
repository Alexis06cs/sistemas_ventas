// src/app/auth/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // ajusta la ruta

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // válido si existe usuario en memoria o token en storage
  const hasSession = !!auth.obtenerUsuario() || !!localStorage.getItem('token');

  if (hasSession) return true;

  router.navigate(['/login']);
  return false;
};
