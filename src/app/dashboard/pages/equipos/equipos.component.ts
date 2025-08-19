import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { Equipo, EquipoApiService, EquipoUpsert } from '../../../services/equipo.service';
import { Categoria, CategoriaApiService } from '../../../services/categoria.service';

@Component({
  selector: 'app-equipos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './equipos.component.html',
  styleUrls: ['./equipos.component.css'],
})
export class EquiposComponent implements OnInit {
  // Permisos de UI (el backend valida de verdad)
  @Input() canCreate = true;   // PROPIETARIO
  @Input() canEdit = true;     // ADMIN
  @Input() canDelete = true;   // ADMIN

  loading = false;
  equipos: Equipo[] = [];
  categorias: Categoria[] = [];

  // filtro + paginación
  search = '';
  page = 1;
  readonly pageSize = 10;

  // modal + form
  modalOpen = false;
  isEdit = false;
  editing?: Equipo;

  // Form no-nullable (ahora usamos categoriaId: number|null)
  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    descripcion: ['', [Validators.maxLength(1000)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoriaId: [null as number | null],
    imagenUrl: [''],
  });

  constructor(
    private api: EquipoApiService,
    private categoriasApi: CategoriaApiService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.cargarCategorias();
  }

  cargar(): void {
    this.loading = true;
    this.api.listar().subscribe({
      next: (rows: Equipo[]) => { this.equipos = rows ?? []; this.page = 1; this.loading = false; },
      error: (err: unknown) => { console.error('Error listando equipos:', err); this.equipos = []; this.loading = false; }
    });
  }

  cargarCategorias(): void {
    this.categoriasApi.listar().subscribe({
      next: (rows: Categoria[]) => { this.categorias = rows ?? []; },
      error: (err: unknown) => { console.error('Error listando categorías:', err); }
    });
  }

  // helpers de vista
  get filtrados(): Equipo[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.equipos;
    return this.equipos.filter((e: Equipo) =>
      (e.nombre?.toLowerCase().includes(q)) ||
      // si categoria viene como objeto con nombre
      (typeof (e as any).categoria === 'object' && ((e as any).categoria?.nombre || '').toLowerCase().includes(q)) ||
      // si el backend devuelve string en algún caso
      (typeof (e as any).categoria === 'string' && String((e as any).categoria).toLowerCase().includes(q)) ||
      String(e.id).includes(q)
    );
  }
  get totalPages(): number { return Math.max(1, Math.ceil(this.filtrados.length / this.pageSize)); }
  cambiarPagina(p: number) { this.page = Math.min(Math.max(1, p), this.totalPages); }
  trackById = (_: number, item: Equipo) => item.id;

  categoriaLabel(e: Equipo): string {
    const c: any = (e as any).categoria;
    if (c == null) return '—';
    return typeof c === 'string' ? c : (c?.nombre ?? '—');
    // (esto es solo para mostrar en la tabla; el form usa categoriaId)
  }

  // Modal
  abrirCrear(): void {
    if (!this.canCreate) return;
    this.isEdit = false;
    this.editing = undefined;
    this.form.setValue({ nombre: '', descripcion: '', precio: 0, stock: 0, categoriaId: null, imagenUrl: '' });
    this.modalOpen = true;
  }

  abrirEditar(e: Equipo): void {
    if (!this.canEdit) return;
    this.isEdit = true;
    this.editing = e;
    const categoriaId = (e as any)?.categoria?.id ?? null;
    this.form.setValue({
      nombre: e.nombre ?? '',
      descripcion: e.descripcion ?? '',
      precio: e.precio ?? 0,
      stock: e.stock ?? 0,
      categoriaId,
      imagenUrl: e.imagenUrl ?? '',
    });
    this.modalOpen = true;
  }

  cerrarModal(): void {
    this.modalOpen = false;
    this.isEdit = false;
    this.editing = undefined;
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();

    // Body que espera el backend (DTO con categoriaId)
    const body: EquipoUpsert = {
      nombre: v.nombre,
      descripcion: v.descripcion,
      precio: v.precio,
      stock: v.stock,
      imagenUrl: v.imagenUrl,
      categoriaId: v.categoriaId != null ? Number(v.categoriaId) : undefined
    };

    // Depuración opcional:
    // console.log('Enviando body', body);

    this.loading = true;
    if (this.isEdit && this.editing) {
      this.api.actualizar(this.editing.id, body).subscribe({
        next: (resp: Equipo) => {
          const idx = this.equipos.findIndex(x => x.id === this.editing!.id);
          if (idx >= 0) this.equipos[idx] = resp;
          this.loading = false;
          this.cerrarModal();
        },
        error: (err: unknown) => { console.error('Error actualizando equipo:', err); this.loading = false; }
      });
    } else {
      this.api.crear(body).subscribe({
        next: (nuevo: Equipo) => {
          this.equipos = [nuevo, ...this.equipos];
          this.page = 1;
          this.loading = false;
          this.cerrarModal();
        },
        error: (err: unknown) => { console.error('Error creando equipo:', err); this.loading = false; }
      });
    }
  }

  eliminar(e: Equipo): void {
    if (!this.canDelete) return;
    if (!confirm(`¿Eliminar equipo "${e.nombre}"?`)) return;

    this.api.eliminar(e.id).subscribe({
      next: () => {
        this.equipos = this.equipos.filter(x => x.id !== e.id);
        const start = (this.page - 1) * this.pageSize;
        if (start >= this.equipos.length && this.page > 1) this.page--;
      },
      error: (err: unknown) => console.error('Error eliminando equipo:', err)
    });
  }
}
