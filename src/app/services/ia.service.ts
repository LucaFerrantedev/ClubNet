import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IAService {
  private apiUrl = 'https://localhost:7121/api/ia/sugerirActividad';

  constructor(private http: HttpClient) {}

  sugerirActividad(datos: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, datos);
  }
}
