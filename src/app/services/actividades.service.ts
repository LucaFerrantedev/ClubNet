import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService } from './login.service';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ActividadesService {
  url = "https://localhost:7121/api/actividad";
  url_user = environment.URL_API+"/usuario";

  constructor(private http: HttpClient, private loginService: LoginService) { }

  // Metodos para gestionar CRUD de Actividades

  GetActividades() {
    const headers = this.loginService.getAuthHeaders();
    return this.http.get(this.url + "/GetActividades", { headers: headers });
  }

  CreateActividad(obj: any) {
    const headers = this.loginService.getAuthHeaders();
    return this.http.post(this.url + "/CreateActividad", obj, { headers: headers });
  }

  UpdateActividad(obj: any) {
    const headers = this.loginService.getAuthHeaders();
    return this.http.put(this.url + "/UpdateActividad", obj, { headers: headers });
  }

  DeleteActividad(id: number) {
    const headers = this.loginService.getAuthHeaders();
    return this.http.delete(this.url + "/DeleteActividad?id=" + id, { headers: headers });
  }

  GetUsuario(email: string) {
    const headers = this.loginService.getAuthHeaders();
    return this.http.get(this.url_user + "/GetUsuario?email=" + email, { headers: headers });
  }
}
