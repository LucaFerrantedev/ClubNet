import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  url = "https://localhost:4200/login";
  urlActividades="https://localhost:7121/api/actividad";
  
  constructor(private httpClient:HttpClient) { }

   Continuar() {
     return this.httpClient.get(this.url + "/Continuar");
   }

   GetActividades(){
    return this.httpClient.get(this.urlActividades+"/GetActividades")
   }
}
