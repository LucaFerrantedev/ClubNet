import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IAService {
  private apiUrl = environment.URL_API+'/ia/sugerirActividad';

  constructor(private http: HttpClient) { }

  // Metodo para sugerir una actividad basada en datos proporcionados
  sugerirActividad(datos: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, datos);
  }
}
