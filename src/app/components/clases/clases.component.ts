import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { ActivatedRoute } from '@angular/router'; // Importar ActivatedRoute
import { ClasesService } from '../../services/clases.service';
import { ActividadesService } from '../../services/actividades.service';
import { NavbarComponent } from '../navbar/navbar.component';

interface GrupoClases {
  actividad: string;
  listaClases: any[];
}

@Component({
  selector: 'app-clases',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './clases.component.html',
  styleUrl: './clases.component.css'
})
export class ClasesComponent implements OnInit {
  misClases: GrupoClases[] = [];
  clasesEntrenador: any[] = []; // Lista simple para el entrenador
  
  isLoading = true;
  isDarkMode = false;
  email = '';
  
  // Variables Entrenador
  esEntrenador = false;
  actividadId: number | null = null;
  nuevaClase = { actividad: '', titulo: '', detalle: '', intensidad: '' };
  showModal = false;

  constructor(
    private clasesService: ClasesService,
    private actividadesService: ActividadesService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const darkModePref = localStorage.getItem('darkMode');
    this.isDarkMode = darkModePref === 'true';
    this.email = localStorage.getItem('email') || '';

    if (this.email) {
      this.verificarUsuarioYRol();
    } else {
      this.isLoading = false;
    }
  }

  verificarUsuarioYRol() {
    this.clasesService.GetUsuario(this.email).subscribe({
      next: (user: any) => {
        this.esEntrenador = user?.rol_id === 2;

        if (this.esEntrenador) {
          // Si es entrenador, miramos si viene un ID en la URL
          this.route.queryParams.subscribe(params => {
            this.actividadId = params['actividadId'] ? Number(params['actividadId']) : null;
            
            if (this.actividadId) {
              this.cargarClasesActividad(this.actividadId);
            } else {
              this.isLoading = false; // No hay actividad seleccionada
            }
          });
        } else {
          // Si es usuario normal, cargamos sus inscripciones
          this.cargarMisClases();
        }
      },
      error: () => this.isLoading = false
    });
  }

  // Lógica USUARIO NORMAL
  cargarMisClases() {
    this.actividadesService.GetInscripcionesUsuario(this.email).subscribe({
      next: (inscripciones: any) => {
        if (Array.isArray(inscripciones) && inscripciones.length > 0) {
          let solicitudesCompletadas = 0;
          inscripciones.forEach((ins: any) => {
            this.clasesService.GetClases(ins.actividad_id).subscribe({
              next: (clases: any) => {
                if (Array.isArray(clases) && clases.length > 0) {
                  this.misClases.push({
                    actividad: ins.actividad_nombre,
                    listaClases: clases
                  });
                }
                solicitudesCompletadas++;
                if (solicitudesCompletadas === inscripciones.length) this.isLoading = false;
              },
              error: () => {
                solicitudesCompletadas++;
                if (solicitudesCompletadas === inscripciones.length) this.isLoading = false;
              }
            });
          });
        } else {
          this.isLoading = false;
        }
      }
    });
  }

  // Lógica ENTRENADOR
  cargarClasesActividad(id: number) {
    this.isLoading = true;
    this.clasesService.GetClases(id).subscribe({
      next: (data: any) => {
        this.clasesEntrenador = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  crearClase() {
    if (!this.actividadId) return;
    const obj = {
      actividad_id: this.actividadId,
      actividad: this.nuevaClase.actividad,
      titulo: this.nuevaClase.titulo,
      detalle: this.nuevaClase.detalle
    };

    this.clasesService.CreateClase(obj).subscribe({
      next: () => {
        // Recargar lista y cerrar modal
        this.cargarClasesActividad(this.actividadId!);
        this.cerrarModal();
        this.nuevaClase = { actividad: '', titulo: '', detalle: '', intensidad: ''}; // Reset form
      },
      error: (err) => console.error("Error creando clase", err)
    });
  }

  abrirModal() { this.showModal = true; }
  cerrarModal() { this.showModal = false; }
}