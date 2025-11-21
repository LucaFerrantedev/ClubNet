import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  url = "https://localhost:7121/api/usuario";

  constructor(private httpClient: HttpClient, private loginService: LoginService) { }
  
  // Obtener todos los usuarios (SOLO ADMIN)
  GetUsuarios() {
    const headers = this.loginService.getAuthHeaders();
    return this.httpClient.get(this.url + "/GetUsuarios", { headers });
  }

  // Obtener roles (usado para select en el form de edición)
  GetRoles() {
    const headers = this.loginService.getAuthHeaders();
    return this.httpClient.get(this.url + "/GetRoles", { headers });
  }

  // Actualizar usuario
  UpdateUsuario(obj: any) {
    const headers = this.loginService.getAuthHeaders();
    return this.httpClient.post(this.url + "/UpdateUsuario", obj, { headers });
  }

  // Crear un nuevo usuario (SOLO ADMIN)
  CreateUser(obj: any) {
    const headers = this.loginService.getAuthHeaders();
    return this.httpClient.post(this.url + "/CreateUser", obj, { headers });
  }

  // Método para obtener datos de usuario (usado para check de admin)
  GetUsuario(email: string) {
    const headers = this.loginService.getAuthHeaders();
    return this.httpClient.get(this.url + "/GetUsuario?email=" + email, { headers });
  }

  // Metodo para eliminar un usuario (SOLO ADMIN)
  DeleteUser(id: number) {
    const headers = this.loginService.getAuthHeaders();
    return this.httpClient.delete(this.url + "/DeleteUsuario?id=" + id, { headers });
  }

  GetUsuariosByRol(rol: number) {
    const headers = this.loginService.getAuthHeaders();
    return this.httpClient.get(this.url + "/GetUsuariosByRol?rol=" + rol, { headers });
  }
}