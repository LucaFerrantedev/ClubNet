import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  url = "https://localhost:7121/api/usuario";

  constructor(private httpClient: HttpClient, private loginService: LoginService) { }

  GetUsuario(email: string) {
    const headers = this.loginService.getAuthHeaders();
    return this.httpClient.get(this.url + "/GetUsuario?email=" + email, { headers });
  }
}
