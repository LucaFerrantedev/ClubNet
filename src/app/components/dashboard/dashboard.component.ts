import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar";
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { IAService } from '../../services/ia.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [NavbarComponent, CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true
})

export class DashboardComponent implements OnInit {

  constructor(
    private service: DashboardService,
    private router: Router,
    private ia: IAService) { }
  DataSourceUsuario: any;
  
  email = '';
  nombre = '';
  apellido = '';
  dni = '';
  sugerencia: string | null = null;
  cargando = false;

  // Propiedades para la entrada del usuario
  edadUsuario: number | null = null;
  interesesUsuario: string = '';
  historialUsuario: string = '';


  ngOnInit(): void {
    this.email = localStorage.getItem('email') || '';
    if (this.email) {
      this.CargarUsuario(this.email);
    } else {
      console.error("No se encontró un email en localStorage. No se puede cargar el usuario.");
    }
  }

  CargarUsuario(email: string) {
    this.service.GetUsuario(email).subscribe({
      next: (x) => {
        this.DataSourceUsuario = x;
        console.log("Datos del usuario recibidos:", this.DataSourceUsuario);
      },
      error: (err) => {
        console.error("Error al cargar los datos del usuario:", err);
      }
    });
  }

  getRolTexto(rolId: number): string {
    switch (rolId) {
      case 1:
        return 'Administrador';
      case 2:
        return 'Entrenador';
      case 3:
        return 'Usuario';
      case 4:
        return 'Socio';
      default:
        return 'No asignado';
    }
  }

  pedirSugerencia() {
    this.cargando = true;
    this.sugerencia = null;

    if (!this.edadUsuario || !this.interesesUsuario) {
      this.sugerencia = 'Por favor, ingresa tu edad e intereses para obtener una sugerencia.';
      this.cargando = false;
      return;
    }

    const interesesArray = this.interesesUsuario.split(',').map(item => item.trim()).filter(item => item);
    const historialArray = this.historialUsuario.split(',').map(item => item.trim()).filter(item => item);

    const datosUsuario = {
      Edad: this.edadUsuario,
      Intereses: interesesArray,
      Historial: historialArray
    };

    this.ia.sugerirActividad(datosUsuario).subscribe({
      next: (res) => {
        this.sugerencia = res.sugerencia;
        this.cargando = false;
      },
      error: () => {
        this.sugerencia = 'Hubo un error al generar la sugerencia.';
        this.cargando = false;
      }
    });
  }






}
