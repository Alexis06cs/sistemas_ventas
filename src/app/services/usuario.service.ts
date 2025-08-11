import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroments } from '../../enviroments';
import { Observable } from 'rxjs';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'VENDEDOR' | 'PROPIETARIO' | 'CLIENTE' | string;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsuarioApiService {
  private readonly base = `${enviroments.baseUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.base);
  }

  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/${id}`);
  }

  cambiarEstado(id: number): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.base}/${id}/estado`, {});
  }
}
