import { Component, OnInit, Input } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CategoriaApiService, Categoria } from '../../../services/categoria.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgClass],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css'],
})
export class CategoriasComponent implements OnInit {
  /** Permisos (puedes conectarlos luego a tu AuthService) */
  @Input() canCreate = true;   // ADMIN
  @Input() canEdit = true;     // ADMIN
  @Input() canDelete = true;   // ADMIN

  loading = false;
  categorias: Categoria[] = [];

  // Filtro + paginación
  search = '';
  page = 1;
  readonly pageSize = 10;

  // Modal + form
  modalOpen = false;
  isEdit = false;
  form!: FormGroup;
  editing?: Categoria;

  constructor(private api: CategoriaApiService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.cargar();
  }

  initForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      descripcion: ['', [Validators.maxLength(500)]],
    });
  }

  f(c: string) { return this.form.get(c); }

  cargar(): void {
    this.loading = true;
    this.api.listar().subscribe({
      next: rows => { this.categorias = rows ?? []; this.page = 1; this.loading = false; },
      error: err => { console.error('Error listando categorías:', err); this.loading = false; this.categorias = []; }
    });
  }

  trackById = (_: number, c: Categoria) => c.id;

  // ---- Filtro + paginación ----
  get filtradas(): Categoria[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.categorias;
    return this.categorias.filter(c =>
      (c.nombre?.toLowerCase().includes(q)) || (c.descripcion?.toLowerCase().includes(q))
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtradas.length / this.pageSize));
  }

  cambiarPagina(p: number): void {
    const next = Math.min(Math.max(1, p), this.totalPages);
    this.page = next;
  }

  // ---- Modal ----
  abrirCrear(): void {
    if (!this.canCreate) return;
    this.isEdit = false;
    this.editing = undefined;
    this.form.reset({ nombre: '', descripcion: '' });
    this.modalOpen = true;
  }

  abrirEditar(cat: Categoria): void {
    if (!this.canEdit) return;
    this.isEdit = true;
    this.editing = cat;
    this.form.reset({ nombre: cat.nombre, descripcion: cat.descripcion || '' });
    this.modalOpen = true;
  }

  cerrarModal(): void {
    this.modalOpen = false;
    this.isEdit = false;
    this.editing = undefined;
  }

  // ---- Guardar (crear/editar) ----
  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const payload = {
      nombre: this.form.value.nombre as string,
      descripcion: (this.form.value.descripcion || '') as string,
    };

    this.loading = true;

    if (this.isEdit && this.editing) {
      this.api.actualizar(this.editing.id, payload).subscribe({
        next: (resp) => {
          const idx = this.categorias.findIndex(x => x.id === this.editing!.id);
          if (idx >= 0) this.categorias[idx] = { ...this.categorias[idx], ...resp };
          this.loading = false;
          this.cerrarModal();
        },
        error: err => { console.error('Error actualizando categoría:', err); this.loading = false; }
      });
    } else {
      this.api.crear(payload).subscribe({
        next: (nuevo) => {
          this.categorias = [nuevo, ...this.categorias];
          this.page = 1;
          this.loading = false;
          this.cerrarModal();
        },
        error: err => { console.error('Error creando categoría:', err); this.loading = false; }
      });
    }
  }

  // ---- Eliminar ----
  eliminar(cat: Categoria): void {
    if (!this.canDelete) return;
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;

    this.api.eliminar(cat.id).subscribe({
      next: () => {
        this.categorias = this.categorias.filter(c => c.id !== cat.id);
        const start = (this.page - 1) * this.pageSize;
        if (start >= this.categorias.length && this.page > 1) this.page--;
      },
      error: err => console.error('Error eliminando categoría:', err)
    });
  }
}
