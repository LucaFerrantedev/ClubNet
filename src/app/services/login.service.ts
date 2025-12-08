import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

// --- INTERFACES CENTRALIZADAS ---
export interface Usuario {
  persona_id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol_id: number;
  dni?: number;
  estado?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private tokenKey = 'authToken';
  // Centraliza tus URLs aquí si no usas environment.ts
  url = environment.URL_API+"/login";
  userUrl = environment.URL_API+"/usuario";

  // SIGNAL: Estado reactivo del usuario logueado
  currentUser = signal<Usuario | null>(null);

  constructor(private httpClient: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) { 
    // Al recargar la página, intentamos recuperar el usuario si hay sesión
    if (this.isUserAuthenticated()) {
      const email = this.getEmail();
      if (email) this.loadUser(email);
    }
  }

  // --- Lógica de Autenticación Optimizada ---

  Login(obj: any): Observable<ApiResponse<string>> {
    return this.httpClient.post<ApiResponse<string>>(`${this.url}/Login`, obj).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setToken(response.data);
          if (obj.email) {
            this.setEmail(obj.email);
            this.loadUser(obj.email); // Cargamos datos del usuario al instante
          }
        }
      })
    );
  }

  // Carga datos del usuario y actualiza el Signal
  loadUser(email: string) {
    this.httpClient.get<Usuario>(`${this.userUrl}/GetUsuario?email=${email}`)
      .subscribe({
        next: (user) => {
          this.currentUser.set(user);
          // Opcional: Guardar rol en storage si se necesita síncronamente
        },
        error: (err) => console.error('Error cargando usuario', err)
      });
  }

  logout(): void {
    this.removeToken();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('email');
    }
    this.currentUser.set(null); // Limpiamos el estado
  }

  // --- Métodos existentes (sin cambios lógicos mayores) ---

  Register(obj: any): Observable<ApiResponse> {
    return this.httpClient.post<ApiResponse>(`${this.url}/Register`, obj);
  }

  RecuperarClave(email: string): Observable<ApiResponse> {
    return this.httpClient.post<ApiResponse>(`${this.url}/RecuperarClave`, { email });
  }

  CambiarClave(obj: any): Observable<ApiResponse> {
    // El interceptor pondrá el token, no hace falta headers manuales
    return this.httpClient.post<ApiResponse>(`${this.url}/CambiarClave`, obj);
  }

  // --- Manejo de Token y Storage ---

  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) return localStorage.getItem(this.tokenKey);
    return null;
  }

  removeToken(): void {
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem(this.tokenKey);
  }

  setEmail(email: string): void {
    if (isPlatformBrowser(this.platformId)) localStorage.setItem('email', email);
  }

  getEmail(): string | null {
    if (isPlatformBrowser(this.platformId)) return localStorage.getItem('email');
    return null;
  }

  // Mantenemos este método por compatibilidad con componentes viejos,
  // pero ya NO es necesario usarlo en los servicios nuevos.
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  isTokenExpired(token: string): boolean {
    if (!token) return true;
    try {
      const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
      return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    } catch (e) {
      return true;
    }
  }

  isUserAuthenticated(): boolean {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) return true;
    this.removeToken();
    return false;
  }
}