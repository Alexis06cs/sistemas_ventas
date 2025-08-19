import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioApiService, Usuario, UsuarioPayload } from '../../../services/usuario.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, NgClass, ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
  loading = false;
  clientes: Usuario[] = [];

  // Paginación
  page = 1;
  readonly pageSize = 6;

  // Formulario (crear/editar)
  showForm = false;
  isEdit = false;
  form!: FormGroup;
  seleccionado: Usuario | null = null;

  roles = ['ADMIN', 'VENDEDOR', 'PROPIETARIO', 'CLIENTE'];

  constructor(
    private usuarioApi: UsuarioApiService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarUsuarios();
  }

  initForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
      rol: ['CLIENTE', [Validators.required]],
      activo: [true],
    });
  }

  trackByClienteId = (_: number, u: Usuario) => u.id;

  cargarUsuarios(): void {
    this.loading = true;
    this.usuarioApi.listarUsuarios().subscribe({
      next: (rows: any) => {
        if (rows && Array.isArray(rows.content)) {
          this.clientes = rows.content;
        } else if (Array.isArray(rows)) {
          this.clientes = rows;
        } else {
          this.clientes = [];
          console.warn('Respuesta inesperada para usuarios:', rows);
        }
        this.page = 1;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.loading = false;
        this.clientes = [];
      },
    });
  }

  // Total de páginas para el footer
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.clientes.length / this.pageSize));
  }

  cambiarPagina(destino: number): void {
    const next = Math.min(Math.max(1, destino), this.totalPages);
    this.page = next;
  }

  // ---------- Activar/Desactivar ----------
  onToggleEstado(u: Usuario): void {
    this.usuarioApi.cambiarEstado(u.id).subscribe({
      next: (actualizado) => {
        const idx = this.clientes.findIndex((x) => x.id === actualizado.id);
        if (idx >= 0) this.clientes[idx].activo = actualizado.activo;
      },
      error: (err) => console.error('Error cambiando estado:', err),
    });
  }

  // ---------- Crear ----------
  onAddUsuario(): void {
    this.isEdit = false;
    this.seleccionado = null;
    this.form.reset({
      nombre: '',
      email: '',
      rol: 'CLIENTE',
      activo: true,
    });
    this.showForm = true;
  }

  // ---------- Editar ----------
  onEditCliente(u: Usuario): void {
    this.isEdit = true;
    this.seleccionado = u;
    this.form.reset({
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      activo: !!u.activo,
    });
    this.showForm = true;
  }

  // ---------- Eliminar ----------
  onDeleteCliente(u: Usuario): void {
    if (!confirm(`¿Eliminar al usuario "${u.nombre}"? Esta acción no se puede deshacer.`)) return;
    this.usuarioApi.eliminarUsuario(u.id).subscribe({
      next: () => {
        this.clientes = this.clientes.filter((x) => x.id !== u.id);
        // Ajuste de página si la actual se queda sin elementos:
        const inicio = (this.page - 1) * this.pageSize;
        if (inicio >= this.clientes.length && this.page > 1) {
          this.page = this.page - 1;
        }
      },
      error: (err) => console.error('Error eliminando usuario:', err),
    });
  }

  // ---------- Guardar (crear/editar) ----------
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: UsuarioPayload = {
      nombre: this.form.value.nombre,
      email: this.form.value.email,
      rol: this.form.value.rol,
      activo: this.form.value.activo,
    };

    if (this.isEdit && this.seleccionado) {
      this.usuarioApi.actualizarUsuario(this.seleccionado.id, payload).subscribe({
        next: (resp) => {
          // Refresca en memoria
          const idx = this.clientes.findIndex((x) => x.id === this.seleccionado!.id);
          if (idx >= 0) {
            this.clientes[idx] = { ...this.clientes[idx], ...resp };
          }
          this.cerrarForm();
        },
        error: (err) => console.error('Error actualizando usuario:', err),
      });
    } else {
      this.usuarioApi.crearUsuario(payload).subscribe({
        next: (nuevo) => {
          // Inserta al inicio
          this.clientes = [nuevo, ...this.clientes];
          this.page = 1;
          this.cerrarForm();
        },
        error: (err) => console.error('Error creando usuario:', err),
      });
    }
  }

  cerrarForm(): void {
    this.showForm = false;
    this.seleccionado = null;
    this.isEdit = false;
  }

  // Helpers UI
  f(control: string) {
    return this.form.get(control);
  }
}
