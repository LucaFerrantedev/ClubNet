import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class InscripcionService {
  url_actividad = "https://localhost:7121/api/actividad";
  url_usuario = "https://localhost:7121/api/usuario";
  url_cobranza = "https://localhost:7121/api/cobranza";

  constructor(private http:HttpClient, private loginService: LoginService){
  }

  GetActividadById(id:number){
    const headers = this.loginService.getAuthHeaders();
    return this.http.get(this.url_actividad + "/GetActividadById/"+id);
  }

  RegisterToActivity(obj:any){
    const headers = this.loginService.getAuthHeaders();
    return this.http.post(this.url_usuario + "/RegisterToActivity",obj,{headers});
  }

  GetLinkMP(obj:any){
    const headers = this.loginService.getAuthHeaders();
    return this.http.post(this.url_cobranza + "/CreatePaymentRequest",obj,{headers});
  }
}