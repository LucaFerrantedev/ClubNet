import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private tokenKey = 'authToken';
  url = "https://localhost:7121/api/login";

  constructor(private httpClient: HttpClient) { }

  // Metodos para gestionar login y registro y manejo de token

  Login(obj: any): Observable<any> {
    return this.httpClient.post<any>(`${this.url}/Login`, obj).pipe(
      tap(response => {
        // La respuesta del backend viene en la propiedad 'data'
        if (response && response.data) {
          this.setToken(response.data); // Acceder directamente a 'data'
        }
      })
    );
  }

  Register(obj: any): Observable<any> {
    return this.httpClient.post(`${this.url}/Register`, obj);
  }

  // Metodos para manejar el token en el localStorage
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Obtener el token de localStorage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Eliminar el token de localStorage
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Metodo para cerrar sesion
  logout(): void {
    this.removeToken();
    localStorage.removeItem('email');
  }

  // Metodo para verificar si el usuario ya inicio sesion

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
