import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class ClasesService {
  url = "https://localhost:7121/api/clase";
  url_user = "https://localhost:7121/api/usuario";

  constructor(private http: HttpClient, private loginService: LoginService) { }

  // Metodo actualizado para filtrar por actividad
  GetClases(actividadId: number) {
    const headers = this.loginService.getAuthHeaders();
    // Se agrega el parámetro actividadId a la query string
    return this.http.get(this.url + "/GetClases?actividadId=" + actividadId, { headers: headers });
  }

  CreateClase(obj: any) {
    const headers = this.loginService.getAuthHeaders();
    return this.http.post(this.url + "/CreateClase", obj, { headers: headers });
  }

  UpdateClase(obj: any) {
    const headers = this.loginService.getAuthHeaders();
    return this.http.put(this.url + "/UpdateClase", obj, { headers: headers });
  }

  DeleteClase(id: number) {
    const headers = this.loginService.getAuthHeaders();
    return this.http.delete(this.url + "/DeleteClase?id=" + id, { headers: headers });
  }

  GetUsuario(email: string) {
    const headers = this.loginService.getAuthHeaders();
    return this.http.get(this.url_user + "/GetUsuario?email=" + email, { headers: headers });
  }
  
  UploadVideo(file: File) {
    const headers = this.loginService.getAuthHeaders();
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(this.url + '/UploadVideo',formData, { headers: headers });
  }

}