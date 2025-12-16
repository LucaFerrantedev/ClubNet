import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  url = environment.URL_API+"/reportes";
  constructor(private http:HttpClient){}

  GetIngresos(){
    return this.http.get(this.url+"/GetIngresos");
  }

  GetDeuda(){
    return this.http.get(this.url+"/GetDeuda");
  }

  GetEstadoCupos(){
    return this.http.get(this.url+"/GetEstadoCupos");
  }

  GetNuevosSocios(){
    return this.http.get(this.url+"/GetNuevosSocios");
  }
}
