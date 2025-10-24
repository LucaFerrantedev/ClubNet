import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private tokenKey = 'authToken';
  url = "https://localhost:7121/api/login"; // Asegúrate que esta URL es correcta

  constructor(private httpClient: HttpClient) { }

  Login(obj: any): Observable<any> {
    return this.httpClient.post<any>(`${this.url}/Login`, obj).pipe(
      tap(response => {
        // La respuesta del backend viene en la propiedad 'data'
        if (response && response.data && response.data.token) {
          this.setToken(response.data.token);
        }
      })
    );
  }

  Register(obj: any): Observable<any> {
    return this.httpClient.post(`${this.url}/Register`, obj);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  logout(): void {
    this.removeToken();
    localStorage.removeItem('email');
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders();
  }
  isTokenExpired(token: string): boolean {
    if (!token) {
      return true;
    }
    try {
      const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
      return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    } catch (e) {
      return true; // Si hay un error al decodificar, el token es inválido
    }
  }

  isUserAuthenticated(): boolean {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      return true;
    }
    this.removeToken(); // Limpia el token si es inválido o ha expirado
    return false;
  }
}
