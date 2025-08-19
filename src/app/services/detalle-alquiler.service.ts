import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { enviroments } from '../../enviroments';

export interface EquipoRef { id: number; nombre?: string; }
export interface AlquilerRef { id: number; codigo?: string; /* ajusta a tu modelo */ }

export interface DetalleAlquiler {
  id: number;
  alquiler: AlquilerRef;
  equipo: EquipoRef;
  cantidad: number;
  precio: number;
}

export type DetallePayload =
  | { alquiler: { id: number }, equipo: { id: number }, cantidad: number, precio: number }
  | { alquilerId: number, equipoId: number, cantidad: number, precio: number };

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
    // Tu backend acepta entity; enviamos forma anidada { alquiler: {id}, equipo: {id} }
    const body = 'alquiler' in data ? data : {
      alquiler: { id: data.alquilerId },
      equipo: { id: data.equipoId },
      cantidad: data.cantidad,
      precio: data.precio,
    };
    return this.http.post<DetalleAlquiler>(this.base, body);
  }

  actualizar(id: number, data: DetallePayload): Observable<DetalleAlquiler> {
    const body = 'alquiler' in data ? data : {
      alquiler: { id: data.alquilerId },
      equipo: { id: data.equipoId },
      cantidad: data.cantidad,
      precio: data.precio,
    };
    return this.http.put<DetalleAlquiler>(`${this.base}/${id}`, body);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
