import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { DashboardService } from '../../services/dashboard.service';
import { ActividadesService } from '../../services/actividades.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  standalone: true
})
export class NavbarComponent implements OnInit {

  userRole: number | null = null;
  isLoggedIn$: Observable<boolean>;

  private actividadesService = inject(ActividadesService);

  // Variables para el Modal de Contraseña
  showPasswordModal = false;
  passData = {
    actual: '',
    nueva: '',
    confirmar: ''
  };
  mensajePass = '';
  tipoMensajePass = '';

  // Variables para notificaciones
  notificaciones: any[] = [];
  // Ya no necesitamos 'showNotificaciones' porque lo maneja CSS con :hover

  constructor(
    private loginService: LoginService,
    private dashboardService: DashboardService,
    private router: Router
  ) {
    this.isLoggedIn$ = of(this.loginService.isUserAuthenticated());
  }

  ngOnInit(): void {
    if (this.loginService.isUserAuthenticated()) {
      const email = localStorage.getItem('email');
      if (email) {
        this.dashboardService.GetUsuario(email).subscribe((user: any) => {
          this.userRole = user?.rol_id;
        });
        
        // Cargar notificaciones
        this.cargarNotificaciones(email);
      }
    }
  }

  cargarNotificaciones(email: string) {
    this.actividadesService.GetNotificaciones(email).subscribe({
      next: (data: any) => {
        this.notificaciones = data || [];
      }
    });
  }

  marcarComoLeido(notif: any) {
    const email = localStorage.getItem('email');
    if (!email) return;

    this.actividadesService.MarcarLeido(notif.comunicado_id, email).subscribe(() => {
      this.notificaciones = this.notificaciones.filter(n => n.comunicado_id !== notif.comunicado_id);
    });
  }

  logout() {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

  abrirModalPassword() {
    this.showPasswordModal = true;
    this.resetPassForm();
  }

  cerrarModalPassword() {
    this.showPasswordModal = false;
  }

  resetPassForm() {
    this.passData = { actual: '', nueva: '', confirmar: '' };
    this.mensajePass = '';
  }

  cambiarPassword() {
    if (!this.passData.actual || !this.passData.nueva || !this.passData.confirmar) {
      this.mostrarMensaje('Todos los campos son obligatorios', 'error');
      return;
    }

    if (this.passData.nueva !== this.passData.confirmar) {
      this.mostrarMensaje('Las contraseñas nuevas no coinciden', 'error');
      return;
    }

    const dto = {
      ClaveActual: this.passData.actual,
      NuevaClave: this.passData.nueva
    };

    this.loginService.CambiarClave(dto).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mostrarMensaje('¡Contraseña actualizada!', 'success');
          setTimeout(() => this.cerrarModalPassword(), 2000);
        } else {
          this.mostrarMensaje(res.message || 'Error al cambiar contraseña', 'error');
        }
      },
      error: () => this.mostrarMensaje('Error de conexión con el servidor', 'error')
    });
  }

  mostrarMensaje(texto: string, tipo: string) {
    this.mensajePass = texto;
    this.tipoMensajePass = tipo;
    if (tipo === 'error') {
      setTimeout(() => {
        this.mensajePass = '';
      }, 3000);
    }
  }
}