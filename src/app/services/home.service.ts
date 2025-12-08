import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  // url = "https://localhost:4200/login";
  urlActividades = environment.URL_API+"/actividad";

  constructor(private httpClient: HttpClient) { }

  // Metodo para verificar si el usuario ya inicio sesion
  // Continuar() {
  //   return this.httpClient.get(this.url + "/Continuar");
  // }

  // Metodo para obtener las actividades destacadas
  GetActividades() {
    return this.httpClient.get(this.urlActividades + "/GetActividades")
  }
}
