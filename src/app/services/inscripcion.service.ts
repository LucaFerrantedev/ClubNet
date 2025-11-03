import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class InscripcionService {
  url_actividad = environment.URL_API+"/actividad";
  url_usuario = environment.URL_API+"/usuario";
  url_cobranza = environment.URL_API+"/cobranza";

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