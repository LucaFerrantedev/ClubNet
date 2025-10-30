import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class InscripcionService {
  url_actividad = environment.URL_API+"/actividad";

  constructor(private http:HttpClient, private loginService: LoginService){
  }

  GetActividadById(id:number){
    const headers = this.loginService.getAuthHeaders();
    return this.http.get(this.url_actividad + "/GetActividadById/"+id);
  }
}