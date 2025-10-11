import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar";
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true
})

export class DashboardComponent implements OnInit {

  constructor(
    private service: DashboardService,
    private router: Router) { }
  DataSourceUsuario: any;

  email = '';
  nombre = '';
  apellido = '';
  dni = '';

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
}
