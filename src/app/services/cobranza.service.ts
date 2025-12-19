import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginService } from './login.service';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CobranzaService {
  url = environment.URL_API+"/cobranza";

  constructor(private http:HttpClient,private loginService:LoginService){}

  GetPagosAll(){
    const headers = this.loginService.getAuthHeaders();
    return this.http.get(this.url + "/GetCobros", { headers: headers });
  }
  GetPagosUser(id:number){
    const headers = this.loginService.getAuthHeaders();
    return this.http.get(this.url + "/GetCobros?persona_id="+id, { headers: headers });
  }

  DescargarRecibo(cobroId: number) {
    const headers = this.loginService.getAuthHeaders();
    return this.http.get(this.url + "/DescargarRecibo/"+cobroId, { headers: headers,responseType: 'blob' });
  }
}
