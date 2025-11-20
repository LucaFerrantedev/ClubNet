import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClasesService } from '../../services/clases.service';
import { NavbarComponent } from '../navbar/navbar.component';

interface Clase {
  clase_id: number;
  actividad_id: number;
  titulo: string;
  detalle: string;
}

@Component({
  selector: 'app-clases',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './clases.component.html',
  styleUrl: './clases.component.css'
})
export class ClasesComponent implements OnInit {
  clases: Clase[] = [];
  isLoading = true;
  isDarkMode = false;

  constructor(private clasesService: ClasesService) { }

  ngOnInit(): void {
    // Cargar preferencia de modo oscuro
    const darkModePref = localStorage.getItem('darkMode');
    this.isDarkMode = darkModePref === 'true';

    this.clasesService.GetClases().subscribe({
      next: (data: any) => {
        this.clases = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar las clases:', err);
        this.isLoading = false;
      }
    });
  }
}
