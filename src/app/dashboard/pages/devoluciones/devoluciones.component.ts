import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Devolucion, DevolucionApiService, DevolucionPayload } from '../../../services/devolucion.service';

@Component({
  selector: 'app-devoluciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './devoluciones.component.html',
  styleUrls: ['./devoluciones.component.css'],
})
export class DevolucionesComponent implements OnInit {
  // Permisos UI (el backend valida de verdad)
  @Input() canCreate = true;   // ADMIN o VENDEDOR
  @Input() canDelete = true;   // solo ADMIN

  loading = false;
  rows: Devolucion[] = [];

  // filtro + paginación
  search = '';
  page = 1;
  readonly pageSize = 10;

  // modal + form (solo crear)
  modalOpen = false;

  form = this.fb.nonNullable.group({
    alquilerId: [0, [Validators.required, Validators.min(1)]],
    fecha:      ['', [Validators.required]],   // usarás input type="date"
    observacion:['', [Validators.maxLength(1000)]],
  });

  constructor(private api: DevolucionApiService, private fb: FormBuilder) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.loading = true;
    this.api.listar().subscribe({
      next: data => { this.rows = data ?? []; this.page = 1; this.loading = false; },
      error: err  => { console.error('Error listando devoluciones:', err); this.rows = []; this.loading = false; }
    });
  }

  // helpers vista
  trackById = (_: number, it: Devolucion) => it.id;

  alquilerLabel(d: Devolucion): string {
    if (!d?.alquiler) return '—';
    return `#${d.alquiler.id}`; // si quieres, muestra nombre si lo trae
  }

  get filtrados(): Devolucion[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter(d =>
      String(d.id).includes(q) ||
      String(d.alquiler?.id ?? '').includes(q) ||
      (d.observacion ?? '').toLowerCase().includes(q) ||
      (d.fecha ?? '').toLowerCase().includes(q)
    );
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.filtrados.length / this.pageSize)); }
  cambiarPagina(p: number) { this.page = Math.min(Math.max(1, p), this.totalPages); }

  // Modal crear
  abrirCrear(): void {
    if (!this.canCreate) return;
    this.form.setValue({ alquilerId: 0, fecha: '', observacion: '' });
    this.modalOpen = true;
  }

  cerrarModal(): void {
    this.modalOpen = false;
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.getRawValue();

    // Si en el backend el tipo es LocalDate, envía 'YYYY-MM-DD' tal cual del input date.
    // Si fuese Instant/LocalDateTime, necesitarás ISO (new Date(...).toISOString()).
    const payload: DevolucionPayload = {
      alquiler:   { id: Number(v.alquilerId) },
      fecha:      v.fecha,            // 'YYYY-MM-DD' desde el input date
      observacion: v.observacion?.trim() || undefined,
    };

    this.loading = true;
    this.api.crear(payload).subscribe({
      next: (nuevo) => {
        this.rows = [nuevo, ...this.rows];
        this.page = 1;
        this.loading = false;
        this.cerrarModal();
      },
      error: err => { console.error('Error creando devolución:', err); this.loading = false; }
    });
  }

  eliminar(d: Devolucion): void {
    if (!this.canDelete) return;
    if (!confirm(`¿Eliminar devolución #${d.id}?`)) return;

    this.api.eliminar(d.id).subscribe({
      next: () => {
        this.rows = this.rows.filter(x => x.id !== d.id);
        const start = (this.page - 1) * this.pageSize;
        if (start >= this.rows.length && this.page > 1) this.page--;
      },
      error: err => console.error('Error eliminando devolución:', err)
    });
  }
}
