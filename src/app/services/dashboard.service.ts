import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  url = "https://localhost:7121/api/usuario";

  constructor(private httpClient: HttpClient) { }

  GetUsuario(email: string) {
    return this.httpClient.get(this.url + "/GetUsuario?email=" + email);
  }
}
