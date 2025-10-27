import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  url = "https://localhost:4200/login";
  urlActividades = "https://localhost:7121/api/actividad";

  constructor(private httpClient: HttpClient) { }

  // Metodo para verificar si el usuario ya inicio sesion
  Continuar() {
    return this.httpClient.get(this.url + "/Continuar");
  }

  // Metodo para obtener las actividades destacadas
  GetActividades() {
    return this.httpClient.get(this.urlActividades + "/GetActividades")
  }
}
