import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
// 👇 Ajusta esta ruta si tu proyecto la tiene diferente
import { enviroments } from '../../enviroments';


export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriaApiService {
  // Si environment.baseUrl ya termina en /api, quedará /api/categorias
  private readonly base = `${enviroments.baseUrl}/categorias`;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    let h = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) h = h.set('Authorization', `Bearer ${token}`);
    return h;
  }

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.base, { headers: this.headers() });
  }

  obtener(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.base}/${id}`, { headers: this.headers() });
  }

  crear(data: Omit<Categoria, 'id'>): Observable<Categoria> {
    return this.http.post<Categoria>(this.base, data, { headers: this.headers() });
  }

  actualizar(id: number, data: Omit<Categoria, 'id'>): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.base}/${id}`, data, { headers: this.headers() });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, { headers: this.headers() });
  }
}
