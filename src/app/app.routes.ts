import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/pages/dashboard/dashboard.component';
import { ClientesComponent } from './dashboard/pages/clientes/clientes.component';
import { authGuard } from './auth/guards/auth.guard'; // 👈 ajusta la ruta si difiere
import { UsuariosComponent } from './dashboard/pages/usuarios/usuarios.component';

export const routes: Routes = [
  // raíz -> login
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },

  // login (standalone)
  { 
    path: 'login', 
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
    title: 'Login'
  },

  // zona protegida (layout + hijos)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, title: 'Dashboard' },
      { path: 'clientes', component: ClientesComponent, title: 'Clientes' },
      {path : 'usuarios', component: UsuariosComponent, title: 'Usuarios'},
      // más rutas protegidas: equipos, alquileres, etc.
    ]
  },

  // wildcard
  { path: '**', redirectTo: 'login' }
];
