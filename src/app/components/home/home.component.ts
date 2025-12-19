import { Component, OnInit } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  // Inicializamos como array vacío para evitar errores en el template antes de la carga
  DataSource: any[] = [];

  constructor(private homeService: HomeService, private router: Router) { }

  ngOnInit(): void {
    this.GetActividades();
  }

  Continuar() {
    this.router.navigate(['/login']);
  }

  GetActividades() {
    this.homeService.GetActividades().subscribe({
      next: (x: any) => {
        // Filtramos solo las actividades activas para la landing page
        this.DataSource = x.filter((act: any) => act.estado === true);
        console.log('Actividades cargadas:', this.DataSource);
      },
      error: (err) => {
        console.error('Error cargando actividades en Home:', err);
      }
    });
  }
}