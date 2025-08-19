import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DetalleAlquiler, DetalleAlquilerApiService, DetallePayload } from '../../../services/detalle-alquiler.service';

@Component({
  selector: 'app-detalles-alquiler',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './detalles-alquiler.component.html',
  styleUrls: ['./detalles-alquiler.component.css'],
})
export class DetallesAlquilerComponent implements OnInit {
  @Input() canCreate = true;
  @Input() canEdit   = true;
  @Input() canDelete = true;

  loading = false;
  rows: DetalleAlquiler[] = [];

  search = '';
  page = 1;
  readonly pageSize = 10;

  modalOpen = false;
  isEdit = false;
  editing?: DetalleAlquiler;

  form = this.fb.nonNullable.group({
    alquilerId: [0, [Validators.required, Validators.min(1)]],
    equipoId:   [0, [Validators.required, Validators.min(1)]],
    cantidad:   [1, [Validators.required, Validators.min(1)]],
    precio:     [0, [Validators.required, Validators.min(0)]],
  });

  constructor(private api: DetalleAlquilerApiService, private fb: FormBuilder) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    this.api.listar().subscribe({
      next: data => { this.rows = data ?? []; this.page = 1; this.loading = false; },
      error: err  => { console.error('Error listando detalles:', err); this.rows = []; this.loading = false; }
    });
  }

  trackById = (_: number, it: DetalleAlquiler) => it.id;

  equipoLabel(d: DetalleAlquiler): string {
    if (!d?.equipo) return '—';
    return d.equipo.nombre ?? `#${d.equipo.id}`;
  }

  alquilerLabel(d: DetalleAlquiler): string {
    if (!d?.alquiler) return '—';
    return `#${d.alquiler.id}`;
  }

  get filtrados(): DetalleAlquiler[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter(d =>
      String(d.id).includes(q) ||
      String(d.alquiler?.id ?? '').includes(q) ||
      (d.equipo?.nombre ?? '').toLowerCase().includes(q) ||
      String(d.equipo?.id ?? '').includes(q)
    );
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filtrados.length / this.pageSize)); }
  cambiarPagina(p: number) { this.page = Math.min(Math.max(1, p), this.totalPages); }

  abrirCrear(): void {
    if (!this.canCreate) return;
    this.isEdit = false;
    this.editing = undefined;
    this.form.setValue({ alquilerId: 0, equipoId: 0, cantidad: 1, precio: 0 });
    this.modalOpen = true;
  }

  abrirEditar(d: DetalleAlquiler): void {
    if (!this.canEdit) return;
    this.isEdit = true;
    this.editing = d;
    this.form.setValue({
      alquilerId: d.alquiler?.id ?? 0,
      equipoId:   d.equipo?.id ?? 0,
      cantidad:   d.cantidad ?? 1,
      precio:     d.precio ?? 0,
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
    // 👇 Tipamos explícitamente como DetallePayload (no Partial<DetalleAlquiler>)
    const payload: DetallePayload = {
      alquiler: { id: Number(v.alquilerId) },
      equipo:   { id: Number(v.equipoId) },
      cantidad: Number(v.cantidad),
      precio:   Number(v.precio),
    };

    this.loading = true;
    if (this.isEdit && this.editing) {
      this.api.actualizar(this.editing.id, payload).subscribe({
        next: (resp) => {
          const idx = this.rows.findIndex(x => x.id === this.editing!.id);
          if (idx >= 0) this.rows[idx] = resp;
          this.loading = false;
          this.cerrarModal();
        },
        error: err => { console.error('Error actualizando detalle:', err); this.loading = false; }
      });
    } else {
      this.api.crear(payload).subscribe({
        next: (nuevo) => {
          this.rows = [nuevo, ...this.rows];
          this.page = 1;
          this.loading = false;
          this.cerrarModal();
        },
        error: err => { console.error('Error creando detalle:', err); this.loading = false; }
      });
    }
  }

  eliminar(d: DetalleAlquiler): void {
    if (!this.canDelete) return;
    if (!confirm(`¿Eliminar detalle #${d.id}?`)) return;

    this.api.eliminar(d.id).subscribe({
      next: () => {
        this.rows = this.rows.filter(x => x.id !== d.id);
        const start = (this.page - 1) * this.pageSize;
        if (start >= this.rows.length && this.page > 1) this.page--;
      },
      error: err => console.error('Error eliminando detalle:', err)
    });
  }

    subtotal(d: DetalleAlquiler): number {
    const c = Number(d?.cantidad ?? 0);
    const p = Number(d?.precio ?? 0);
    return c * p;
  }

}
