// src/app/dashboard/pages/usuarios/usuarios.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario, UsuarioApiService } from '../../../services/usuario.service'; // 👈 usa ruta relativa

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.component.html'
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  loading = false;
  error: string | null = null;

  constructor(private usuarioApi: UsuarioApiService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.error = null;
    this.usuarioApi.listarUsuarios().subscribe({
      next: (data: Usuario[]) => {
        this.usuarios = data;
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error(err);
        this.error = 'No se pudo cargar la lista de usuarios.';
        this.loading = false;
      }
    });
  }

  trackById = (_: number, u: Usuario) => u.id;

  onVer(u: Usuario): void {
    console.log('Ver usuario', u);
  }

  onToggleEstado(u: Usuario): void {
    const prev = u.activo;
    u.activo = !u.activo;

    this.usuarioApi.cambiarEstado(u.id).subscribe({
      next: (actualizado: Usuario) => {
        u.activo = actualizado.activo;
      },
      error: (err: unknown) => {
        console.error(err);
        u.activo = prev;
        alert('No se pudo cambiar el estado del usuario.');
      }
    });
  }

  onAddUser(): void {
    console.log('Abrir modal crear usuario');
  }
}
