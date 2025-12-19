import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { ActividadesService } from '../../services/actividades.service';

@Component({
  selector: 'app-inscripciones.component',
  imports: [CommonModule,NavbarComponent],
  templateUrl: './inscripciones.component.html',
  styleUrl: './inscripciones.component.css'
})
export class InscripcionesComponent implements OnInit{
  inscripciones: any[] = [];
  isLoading = true;
  email:any;
  isDarkMode = false;

  constructor(private service:ActividadesService) {}

  ngOnInit(): void {
    this.email = localStorage.getItem('email') || '';
    this.TraerInscripciones();
  }

  TraerInscripciones(){
    this.service.GetInscripcionesUsuario(this.email).subscribe({
      next: (res: any) => {
        console.log(res);
        this.inscripciones = res || []; 
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando inscripciones', err);
        this.isLoading = false;
      }
    });
  }
}
