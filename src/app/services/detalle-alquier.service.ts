import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { enviroments } from '../../enviroments';

export interface Ref { id: number; nombre?: string; }

export interface DetalleAlquiler {
  id: number;
  alquiler: Ref | null;
  equipo: Ref | null;
  cantidad: number;
  precio: number;
}

// 👉 Payload que el backend espera para create/update
export type DetallePayload = {
  alquiler: { id: number };
  equipo:   { id: number };
  cantidad: number;
  precio:   number;
};

@Injectable({ providedIn: 'root' })
export class DetalleAlquilerApiService {
  private readonly base = `${enviroments.baseUrl}/detalles-alquiler`;

  constructor(private http: HttpClient) {}

  listar(): Observable<DetalleAlquiler[]> {
    return this.http.get<DetalleAlquiler[]>(this.base);
  }

  obtener(id: number): Observable<DetalleAlquiler> {
    return this.http.get<DetalleAlquiler>(`${this.base}/${id}`);
  }

  crear(data: DetallePayload): Observable<DetalleAlquiler> {
    return this.http.post<DetalleAlquiler>(this.base, data);
  }

  actualizar(id: number, data: DetallePayload): Observable<DetalleAlquiler> {
    return this.http.put<DetalleAlquiler>(`${this.base}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
