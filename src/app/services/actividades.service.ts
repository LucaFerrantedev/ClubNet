import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class ActividadesService {

  url = "https://localhost:7121/api/actividad";

  constructor(private http: HttpClient, private loginService: LoginService) {}

  getActividades() {
    return this.http.get(this.url + "/GetActividades");
  }
}
