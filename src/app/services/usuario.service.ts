import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { enviroments } from '../../enviroments';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'VENDEDOR' | 'PROPIETARIO' | 'CLIENTE' | string;
  activo: boolean; // 1 = activo, 0 = inactivo en DB; aquí manejamos boolean
}

export interface UsuarioPayload {
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'VENDEDOR' | 'PROPIETARIO' | 'CLIENTE' | string;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsuarioApiService {
  private readonly base = `${enviroments.baseUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  listarUsuarios(): Observable<Usuario[] | { content: Usuario[]; totalElements: number }> {
    return this.http.get<Usuario[] | { content: Usuario[]; totalElements: number }>(this.base);
  }

  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/${id}`);
  }

  crearUsuario(data: UsuarioPayload): Observable<Usuario> {
    // Si tu backend aún no tiene POST /usuarios, te paso abajo el controlador sugerido.
    return this.http.post<Usuario>(this.base, data);
  }

  actualizarUsuario(id: number, data: UsuarioPayload): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.base}/${id}`, data);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  cambiarEstado(id: number): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.base}/${id}/estado`, {});
  }
}
