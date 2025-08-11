import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { enviroments } from '../../enviroments';

export interface UsuarioSesion {
  token: string;
  nombre: string;
  rol: 'ADMIN' | 'VENDEDOR' | 'PROPIETARIO' | 'CLIENTE' | string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
 private baseUrl: string = enviroments.baseUrl;
  private usuarioSubject = new BehaviorSubject<UsuarioSesion | null>(this.cargarDeStorage());
  usuario$ = this.usuarioSubject.asObservable();
    private cargarDeStorage(): UsuarioSesion | null {
    const token = localStorage.getItem('token');
    const nombre = localStorage.getItem('nombre');
    const rol = localStorage.getItem('rol');
    const email = localStorage.getItem('email') || undefined;
    if (token && nombre && rol) return { token, nombre, rol, email };
    return null;
  }

  constructor(private http: HttpClient) {

  }

  login(email: string, password: string): Observable<UsuarioSesion> {
    return this.http.post<UsuarioSesion>(`${this.baseUrl}/auth/login`, { email, password })
      .pipe(
        tap(res => this.establecerSesion(res))
      );
  }
  establecerSesion(data: UsuarioSesion) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('nombre', data.nombre);
    localStorage.setItem('rol', data.rol);
    if (data.email) localStorage.setItem('email', data.email);
    this.usuarioSubject.next(data);
  }

  register(nombre: string, email: string, password: string, rol: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, { nombre, email, password, rol });
  }

 guardarToken(token: string) { // si aún lo usas en otras partes
    localStorage.setItem('token', token);
    const actual = this.usuarioSubject.value;
    if (actual) this.usuarioSubject.next({ ...actual, token });
  }
   obtenerUsuario(): UsuarioSesion | null {
    return this.usuarioSubject.value;
  }
    logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    localStorage.removeItem('rol');
    localStorage.removeItem('email');
    this.usuarioSubject.next(null);
  }
  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }



}
