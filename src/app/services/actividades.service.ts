import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse, Usuario } from './login.service'; // Reutilizamos tipos

// --- INTERFAZ ESPECÍFICA ---
export interface Actividad {
  actividad_id: number;
  nombre: string;
  descripcion: string;
  cupo: number;
  inicio: number; // Formato YYYYMM
  cuota_valor: number;
  estado: boolean;
  url_imagen: string;
  entrenador_id?: number | null;
  ent_nombre?: string;
  ent_apellido?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActividadesService {
  url = "https://localhost:7121/api/actividad";
  url_user = "https://localhost:7121/api/usuario";

  // Ya no necesitamos LoginService aquí, el interceptor maneja la auth
  constructor(private http: HttpClient) { }

  GetActividades() {
    return this.http.get<ApiResponse<Actividad[]>>(`${this.url}/GetActividades`);
  }

  CreateActividad(obj: Actividad) {
    return this.http.post<ApiResponse>(`${this.url}/CreateActividad`, obj);
  }

  UpdateActividad(obj: Actividad) {
    return this.http.put<ApiResponse>(`${this.url}/UpdateActividad`, obj);
  }

  DeleteActividad(id: number) {
    return this.http.delete<ApiResponse>(`${this.url}/DeleteActividad?id=${id}`);
  }

  GetUsuario(email: string) {
    return this.http.get<Usuario>(`${this.url_user}/GetUsuario?email=${email}`);
  }

  GetInscripcionesUsuario(email: string) {
    return this.http.get<ApiResponse<any[]>>(`${this.url}/GetInscripciones/${email}`);
  }
}