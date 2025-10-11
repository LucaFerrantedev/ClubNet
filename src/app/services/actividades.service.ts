import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class ActividadesService {
  url_user = "https://localhost:7121/api/usuario";
  url = "https://localhost:7121/api/actividad";

  constructor(private http: HttpClient, private loginService: LoginService) { }

  GetActividades() {
    const headers = this.loginService.getAuthHeaders();
    return this.http.get(this.url + "/GetActividades", { headers: headers });
  }

  CreateActividad(obj: any) {
    const headers = this.loginService.getAuthHeaders();
    return this.http.post(this.url + "/CreateActividad", obj, { headers: headers });
  }

  GetUsuario(email: string) {
    return this.http.get(this.url_user + "/GetUsuario?email=" + email);
  }
}
