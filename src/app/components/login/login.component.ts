import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true
})
export class LoginComponent {
  recordarDatos = false;

  mensajeTipo = '';

  constructor(private loginService: LoginService, private router: Router) { }

  // Todos los registrados son usuarios normales por defecto
  dni: string = '';
  nombre: string = '';
  apellido: string = '';
  rol: number = 3;
  email: string = '';
  clave: any;

  confirmarClave: any;
  datasourceRegister: any;
  datasourceLogin: any;
  mensaje: any;

  ngOnInit(): void {
    // Si hay datos guardados y recordarDatos, redirigir automáticamente
    const record = localStorage.getItem('recordarDatos');
    const email = localStorage.getItem('email');
    const clave = localStorage.getItem('clave');
    if (record === 'true' && email && clave) {
      this.router.navigate(['/dashboard']);
    }
  }

  activeTab: 'login' | 'register' = 'login';


  onLogin() {
    let obj = {
      "email": this.email,
      "clave": btoa(this.clave)
    }
    this.loginService.Login(obj).subscribe({
      next: (x) => {
        this.datasourceLogin = x;
        if ((x as any).success === true) {
          this.loginService.setLoggedIn(true);
          this.mensaje = '¡Login exitoso!';
          this.mensajeTipo = 'success';
          if (this.recordarDatos) {
            localStorage.setItem('recordarDatos', 'true');
            localStorage.setItem('email', this.email);
            localStorage.setItem('clave', this.clave);
          } else {
            localStorage.removeItem('recordarDatos');
            localStorage.removeItem('email');
            localStorage.removeItem('clave');
          }
          this.router.navigate(['/dashboard']);
        } else if ((x as any).success === false) {
          this.mensaje = 'Login fallido. Verifica tus datos.';
          this.mensajeTipo = 'error';
        } else {
          this.mensaje = '';
          this.mensajeTipo = '';
        }
        this.resetForm();
        setTimeout(() => { this.mensaje = ''; this.mensajeTipo = ''; }, 2500);
      },
      error: () => {
        this.mensaje = 'Error de conexión.';
        this.mensajeTipo = 'error';
        this.resetForm();
        setTimeout(() => { this.mensaje = ''; this.mensajeTipo = ''; }, 2500);
      }
    });
  }

  onRegister() {
    if (!this.dni || !this.nombre || !this.apellido || !this.email || !this.clave || !this.confirmarClave) {
      this.mensaje = 'Todos los campos son obligatorios.';
      this.mensajeTipo = 'error';
      return;
    }
    if (this.clave !== this.confirmarClave) {
      this.mensaje = 'Las contraseñas no coinciden.';
      this.mensajeTipo = 'error';
      this.clave = '';
      this.confirmarClave = '';
      return;
    }
    let obj = {
      "dni": Number(this.dni),
      "nombre": this.nombre,
      "apellido": this.apellido,
      "rol": this.rol,
      "email": this.email,
      "clave": btoa(this.clave)
    }
    this.loginService.Register(obj).subscribe({
      next: (response) => {
        let success = (typeof response === 'boolean') ? response : (response as any).success;
        if (success === true) {
          this.mensaje = '¡Registro exitoso!';
          this.mensajeTipo = 'success';
        } else if (success === false) {
          this.mensaje = 'Registro fallido. Intenta de nuevo.';
          this.mensajeTipo = 'error';
        } else {
          this.mensaje = '';
          this.mensajeTipo = '';
        }
        this.resetForm();
        setTimeout(() => { this.mensaje = ''; this.mensajeTipo = ''; }, 2500);
      },
      error: () => {
        this.mensaje = 'Error de conexión.';
        this.mensajeTipo = 'error';
        this.resetForm();
        setTimeout(() => { this.mensaje = ''; this.mensajeTipo = ''; }, 2500);
      }
    });

  }

  // Resetea los campos del formulario
  resetForm() {
    this.dni = '';
    this.nombre = '';
    this.apellido = '';
    this.email = '';
    this.clave = '';
    this.confirmarClave = '';
  }

}