import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse, Usuario } from './login.service';
import { environment } from '../../environments/environment';

export interface Actividad {
  actividad_id: number;
  nombre: string;
  descripcion: string;
  cupo: number;
  inicio: number;
  cuota_valor: number;
  estado: boolean;
  url_imagen: string;
  entrenador_id?: number | null;
  ent_nombre?: string;
  ent_apellido?: string;
}

export interface ComunicadoDTO {
  actividad_id: number;
  entrenador_id: number;
  asunto: string;
  detalle: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActividadesService {
  url = environment.URL_API + "/actividad";
  url_user = environment.URL_API + "/usuario";

  constructor(private http: HttpClient) { }

  GetActividades(entrenadorId?: number) {
      let urlRequest = `${this.url}/GetActividades`;

      // Si viene el ID, lo agregamos a la URL como Query Param
      if (entrenadorId) {
        urlRequest += `?entrenadorId=${entrenadorId}`;
      }

      return this.http.get<ApiResponse<Actividad[]>>(urlRequest);
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

  CrearComunicado(obj: ComunicadoDTO) {
    return this.http.post<ApiResponse>(`${this.url}/CrearComunicado`, obj);
  }

  GetNotificaciones(email: string) {
    return this.http.get<any[]>(`${this.url}/GetNotificaciones?email=${email}`);
  }

  MarcarLeido(id: number, email: string) {
    return this.http.post(`${this.url}/MarcarLeido?id=${id}&email=${email}`, {});
  }
}