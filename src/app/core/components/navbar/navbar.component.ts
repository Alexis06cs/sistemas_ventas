// navbar.component.ts
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, NgIf } from '@angular/common';
import { Router } from '@angular/router';

// ⬇️ Ajusta la ruta a tu AuthService real
import { AuthService, UsuarioSesion } from '../../../services/auth.service';

import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, AsyncPipe, NgIf],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  search = '';

  // Tipado explícito, sin casts raros
  usuario$: Observable<UsuarioSesion | null> = this.auth.usuario$;

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
