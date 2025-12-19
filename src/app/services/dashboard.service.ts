import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService } from './login.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  url = environment.URL_API+"/usuario";

  constructor(private httpClient: HttpClient, private loginService: LoginService) { }

  // Metodo para obtener datos del usuario para el dashboard
  GetUsuario(email: string) {
    const headers = this.loginService.getAuthHeaders();
    return this.httpClient.get(this.url + "/GetUsuario?email=" + email, { headers });
  }
}
