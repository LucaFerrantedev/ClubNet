import { Component, OnInit, inject } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { IAService } from '../../services/ia.service';
import { ActividadesService } from '../../services/actividades.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [NavbarComponent, CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true
})

export class DashboardComponent implements OnInit {

  private service = inject(DashboardService);
  private ia = inject(IAService); // Se mantiene para los alumnos
  private actividadesService = inject(ActividadesService);
  
  DataSourceUsuario: any;
  isDarkMode = false;
  email = '';

  // Datos para IA (Alumnos)
  sugerencia: string | null = null;
  cargando = false;
  edadUsuario: number | null = null;
  interesesUsuario: string = '';
  historialUsuario: string = '';

  // Datos para Alumnos (Panel Derecho)
  misActividades: any[] = [];
  loadingClases = false;

  // Datos para Entrenadores
  actividadesEntrenador: any[] = [];
  loadingEntrenador = false;

  ngOnInit(): void {
    this.email = localStorage.getItem('email') || '';
    if (this.email) {
      this.CargarUsuario(this.email);
    } else {
      console.error("No se encontró un email en localStorage.");
    }

    const darkModePref = localStorage.getItem('darkMode');
    this.isDarkMode = darkModePref === 'true';
    this.applyDarkMode();
  }

  CargarUsuario(email: string) {
    this.service.GetUsuario(email).subscribe({
      next: (x) => {
        this.DataSourceUsuario = x;
        
        // Lógica según rol
        if (this.DataSourceUsuario.rol_id === 2) {
          // Es Entrenador: Cargar sus actividades
          this.CargarActividadesComoEntrenador(this.DataSourceUsuario.persona_id);
        } else {
          // Es Alumno/Socio: Cargar inscripciones (y dejar disponible la IA)
          this.CargarMisInscripciones(this.email);
        }
      },
      error: (err) => console.error(err)
    });
  }

  // --- Lógica Alumnos ---
  CargarMisInscripciones(email: string) {
    this.loadingClases = true;
    this.actividadesService.GetInscripcionesUsuario(email).subscribe({
      next: (res: any) => {
        if (res.data) this.misActividades = res.data;
        else if (Array.isArray(res)) this.misActividades = res;
        else this.misActividades = [];
        this.loadingClases = false;
      },
      error: () => this.loadingClases = false
    });
  }

  pedirSugerencia() {
    this.cargando = true;
    this.sugerencia = null;

    if (!this.edadUsuario || !this.interesesUsuario) {
      this.sugerencia = 'Por favor, ingresa tu edad e intereses.';
      this.cargando = false;
      return;
    }

    const datosUsuario = {
      Edad: this.edadUsuario,
      Intereses: this.interesesUsuario.split(','),
      Historial: this.historialUsuario.split(',')
    };

    this.ia.sugerirActividad(datosUsuario).subscribe({
      next: (res) => {
        this.sugerencia = res.sugerencia;
        this.cargando = false;
      },
      error: () => {
        this.sugerencia = '¡😐 Algo salió mal! Intenta de nuevo.';
        this.cargando = false;
      }
    });
  }

  // --- Lógica Entrenadores ---
  CargarActividadesComoEntrenador(personaId: number) {
    this.loadingEntrenador = true;
    this.actividadesService.GetActividades().subscribe({
      next: (res: any) => {
        const todas = res.data || (Array.isArray(res) ? res : []);
        this.actividadesEntrenador = todas.filter((a: any) => a.entrenador_id === personaId);
        this.loadingEntrenador = false;
      },
      error: () => this.loadingEntrenador = false
    });
  }

  getRolTexto(rolId: number): string {
    switch (rolId) {
      case 1: return 'Administrador';
      case 2: return 'Entrenador';
      case 3: return 'Usuario';
      case 4: return 'Socio';
      default: return 'No asignado';
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.applyDarkMode();
  }

  private applyDarkMode(): void {
    const body = document.body;
    if (this.isDarkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
  }
}