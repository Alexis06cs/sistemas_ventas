import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { enviroments } from '../../enviroments';

export interface Ref { id: number; nombre?: string; }

export interface Devolucion {
  id: number;
  alquiler: Ref | null;   // relación (el backend espera objeto {id})
  fecha: string;          // ISO o 'YYYY-MM-DD' según tu entidad (LocalDate => 'YYYY-MM-DD')
  observacion?: string;
  // agrega aquí si tu modelo tiene más campos (multa, estado, etc.)
}

// Payload que el backend espera para crear
export type DevolucionPayload = {
  alquiler: { id: number };
  fecha: string;           // ej. '2025-08-17' si usas LocalDate
  observacion?: string;
};

@Injectable({ providedIn: 'root' })
export class DevolucionApiService {
  private readonly base = `${enviroments.baseUrl}/devoluciones`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Devolucion[]> {
    return this.http.get<Devolucion[]>(this.base);
  }

  obtener(id: number): Observable<Devolucion> {
    return this.http.get<Devolucion>(`${this.base}/${id}`);
  }

  crear(data: DevolucionPayload): Observable<Devolucion> {
    return this.http.post<Devolucion>(this.base, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
