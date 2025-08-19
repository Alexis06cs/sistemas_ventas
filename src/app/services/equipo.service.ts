import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// 👇 Ajusta esta ruta si tu proyecto la tiene diferente
import { enviroments } from '../../enviroments';

export interface PropietarioRef { id: number; nombre?: string; email?: string; }

// Puedes reusar la interfaz de categoría del otro service.
// Para evitar acoplamiento de rutas, declaramos una mínima aquí:
export interface CategoriaRef { id: number; nombre?: string; }

// Lo que devuelve el backend (respuesta)
export interface Equipo {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria?: CategoriaRef | string | null; // a veces el backend trae objeto; evita usar string hacia el backend
  imagenUrl?: string;
  propietario?: PropietarioRef | null;
}

// Lo que enviamos al backend (request de crear/actualizar)
export interface EquipoUpsert {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  categoriaId?: number | null;   // ← ESTE ES EL CAMPO CLAVE
  imagenUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class EquipoApiService {
  // Si environment.baseUrl ya termina en /api, quedará /api/equipos
  private readonly base = `${enviroments.baseUrl}/equipos`;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    let h = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) h = h.set('Authorization', `Bearer ${token}`);
    return h;
  }

  // ADMIN / VENDEDOR -> lista completa
  listar(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(this.base, { headers: this.headers() });
  }

  // Detalle
  obtener(id: number): Observable<Equipo> {
    return this.http.get<Equipo>(`${this.base}/${id}`, { headers: this.headers() });
  }

  // PROPIETARIO -> crea (el backend setea propietario desde Authentication)
  // IMPORTANT: envía categoriaId numérico (no string "Tecnologia")
  crear(data: EquipoUpsert): Observable<Equipo> {
    return this.http.post<Equipo>(this.base, data, { headers: this.headers() });
  }

  // ADMIN -> actualizar
  actualizar(id: number, data: EquipoUpsert): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.base}/${id}`, data, { headers: this.headers() });
  }

  // ADMIN -> eliminar
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, { headers: this.headers() });
  }

  // PROPIETARIO -> mis equipos
  listarMisEquipos(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.base}/mis-equipos`, { headers: this.headers() });
  }

  // Catálogo general (roles: CLIENTE/PROPIETARIO/VENDEDOR/ADMIN)
  catalogo(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.base}/catalogo`, { headers: this.headers() });
  }
}
