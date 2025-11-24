import { Component, OnInit } from '@angular/core';
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
export class LoginComponent implements OnInit {

  mensajeTipo = '';

  constructor(private loginService: LoginService, private router: Router) { }

  // Si el usuario ya está autenticado, redirigir al dashboard
  ngOnInit(): void {
    if (this.loginService.isUserAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Todos los registrados son usuarios normales (rol 3) por defecto
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
  recoveryEmail: string = '';

  // Controla la pestaña activa (login o register)
  activeTab: 'login' | 'register' | 'recovery' = 'login';

  // Cuando se clickea el boton de iniciar sesion
  onLogin() {
    let obj = {
      "email": this.email,
      "clave": this.clave
    }

    this.loginService.Login(obj).subscribe({
      next: (x: any) => {
        // 1. Cambia la condición: Comprueba que x.data exista y no sea nulo.
        if (x.success === true && x.data) {
          // 2. Cambia la asignación: Pasa x.data (que es el token) directamente.
          this.loginService.setToken(x.data);
          localStorage.setItem('email', this.email);
          this.mensaje = '¡Login exitoso!';
          this.mensajeTipo = 'success';
          this.router.navigate(['/dashboard']);
        } else {
          this.mensaje = 'Login fallido. Verifica tus datos.';
          this.mensajeTipo = 'error';
        }

        // Resetea los campos del formulario
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

  // Esto pasa cuando se apreta el boton de registrarse
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
      "clave": (this.clave)
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

  switchToRecovery() {
    this.activeTab = 'recovery';
    this.mensaje = '';
  }

  backToLogin() {
    this.activeTab = 'login';
    this.mensaje = '';
  }

  onRecovery() {
    if (!this.recoveryEmail) {
      this.mensaje = 'Ingresa tu email.';
      this.mensajeTipo = 'error';
      return;
    }

    this.loginService.RecuperarClave(this.recoveryEmail).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mensaje = 'Revisa tu correo con la nueva contraseña.';
          this.mensajeTipo = 'success';
          setTimeout(() => this.backToLogin(), 4000);
        } else {
          this.mensaje = res.message || 'Error al recuperar.';
          this.mensajeTipo = 'error';
        }
      },
      error: () => {
        this.mensaje = 'Error de conexión.';
        this.mensajeTipo = 'error';
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