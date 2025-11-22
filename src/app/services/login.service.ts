import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private tokenKey = 'authToken';
  url = "https://localhost:7121/api/login";

  constructor(private httpClient: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) { }

  // Metodos para gestionar login y registro y manejo de token

  Login(obj: any): Observable<any> {
    return this.httpClient.post<any>(`${this.url}/Login`, obj).pipe(
      tap(response => {
        if (response && response.data) {
          this.setToken(response.data);
        }
      })
    );
  }

  Register(obj: any): Observable<any> {
    return this.httpClient.post(`${this.url}/Register`, obj);
  }

  RecuperarClave(email: string): Observable<any> {
    return this.httpClient.post(`${this.url}/RecuperarClave`, { email: email });
  }

  CambiarClave(obj: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.httpClient.post(`${this.url}/CambiarClave`, obj, { headers });
  }

  // Metodos para manejar el token en el localStorage
  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  // Obtener el token de localStorage
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  // Eliminar el token de localStorage
  removeToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }
  }

  // Metodo para cerrar sesion
  logout(): void {
    this.removeToken();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('email');
    }
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
      return true;
    }
  }

  isUserAuthenticated(): boolean {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      return true;
    }
    if (isPlatformBrowser(this.platformId)) {
      this.removeToken();
    }
    return false;
  }

}
