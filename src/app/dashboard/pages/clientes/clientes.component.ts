import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';

// ⛳ Usa el path de tu servicio real.
// Si tu archivo se llama usuario-api.service.ts, cambia el import.
import { UsuarioApiService, Usuario } from '../../../services/usuario.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  loading = false;
  clientes: Usuario[] = [];

  // Paginación
  page = 1;
  readonly pageSize = 10;

  constructor(private usuarioApi: UsuarioApiService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  trackByClienteId = (_: number, u: Usuario) => u.id;

  cargarUsuarios(): void {
    this.loading = true;
    this.usuarioApi.listarUsuarios().subscribe({
      next: (rows: any) => {
        // Soporta respuesta como Page de Spring o array plano
        if (rows && Array.isArray(rows.content)) {
          this.clientes = rows.content;
        } else if (Array.isArray(rows)) {
          this.clientes = rows;
        } else {
          this.clientes = [];
          console.warn('Respuesta inesperada para usuarios:', rows);
        }
        this.page = 1; // reset al cambiar la data
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.loading = false;
        this.clientes = [];
      },
    });
  }

  // Total de páginas para mostrar en el footer
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.clientes.length / this.pageSize));
  }

  cambiarPagina(destino: number): void {
    const next = Math.min(Math.max(1, destino), this.totalPages);
    this.page = next;
  }

  onToggleEstado(u: Usuario): void {
    this.usuarioApi.cambiarEstado(u.id).subscribe({
      next: (actualizado) => {
        const idx = this.clientes.findIndex(x => x.id === actualizado.id);
        if (idx >= 0) this.clientes[idx].activo = actualizado.activo;
      },
      error: (err) => console.error('Error cambiando estado:', err),
    });
  }

  onEditCliente(u: Usuario): void {
    console.log('Editar usuario:', u);
    // abrir modal / navegar a edición
  }

  onAddUsuario(): void {
    console.log('Agregar usuario');
    // abrir modal / navegar a creación
  }
}
