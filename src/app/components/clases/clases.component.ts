import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  clasesEntrenador: any[] = [];
  
  isLoading = true;
  isDarkMode = false;
  email = '';
  
  // Variables Entrenador
  esEntrenador = false;
  actividadId: number | null = null; // ID de la actividad que se está visualizando
  
  // Lista de actividades asignadas al entrenador (para el select del modal)
  actividadesDelEntrenador: any[] = []; 

  // Modelo para el formulario (ahora incluye actividad_id)
  nuevaClase = { actividad_id: 0, actividad: '', titulo: '', detalle: '', intensidad: '', url_multimedia: '' };
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
          // 1. Cargar las actividades asignadas a este entrenador
          this.cargarActividadesAsignadas(user.persona_id);

          // 2. Revisar si viene un ID por URL para cargar la tabla inicial
          this.route.queryParams.subscribe(params => {
            this.actividadId = params['actividadId'] ? Number(params['actividadId']) : null;
            
            if (this.actividadId) {
              this.cargarClasesActividad(this.actividadId);
              // Pre-seleccionar esta actividad en el modal
              this.nuevaClase.actividad_id = this.actividadId;
            } else {
              this.isLoading = false; 
            }
          });
        } else {
          this.cargarMisClases();
        }
      },
      error: () => this.isLoading = false
    });
  }

  // --- Lógica ENTRENADOR ---

  cargarActividadesAsignadas(personaId: number) {
    this.actividadesService.GetActividades().subscribe({
      next: (data: any) => {
        // Filtramos solo las actividades donde el entrenador coincide
        this.actividadesDelEntrenador = data.filter((a: any) => a.entrenador_id === personaId);
      }
    });
  }

  cargarClasesActividad(id: number) {
    this.isLoading = true;
    this.actividadId = id; // Actualizamos el ID actual
    this.clasesService.GetClases(id).subscribe({
      next: (data: any) => {
        this.clasesEntrenador = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // Método auxiliar para cambiar de actividad desde la vista (si quisieras un dropdown de filtro)
  cambiarActividadVisualizada(id: number) {
    this.cargarClasesActividad(id);
  }

crearClase() {
    // Validar que se haya seleccionado una actividad
    if (!this.nuevaClase.actividad_id) {
      alert("Por favor selecciona una actividad.");
      return;
    }

    // AJUSTE: Enviamos 'Actividad' como string para satisfacer al backend actual
    const obj = {
      Actividad_ID: this.nuevaClase.actividad_id,
      Actividad: this.nuevaClase.actividad,
      Titulo: this.nuevaClase.titulo,
      Detalle: this.nuevaClase.detalle,
      Intensidad: this.nuevaClase.intensidad,
      Url_Multimedia: this.nuevaClase.url_multimedia,
    };

    this.clasesService.CreateClase(obj).subscribe({
      next: () => {
        // Si la clase creada corresponde a la actividad que estamos viendo, recargamos la lista
        if (this.actividadId === this.nuevaClase.actividad_id) {
          this.cargarClasesActividad(this.actividadId);
        }
        this.cerrarModal();
        // Resetear form pero mantener la actividad seleccionada por comodidad
        this.nuevaClase = { actividad_id: this.nuevaClase.actividad_id, actividad: '', titulo: '', detalle: '', intensidad: '', url_multimedia: '' };
      },
      error: (err) => console.error("Error creando clase", err)
    });
  }

  // --- Lógica USUARIO NORMAL ---
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

  abrirModal() { 
    this.showModal = true;
    // Asegurar que si hay una actividad visualizándose, sea la default en el modal
    if (this.actividadId) {
        this.nuevaClase.actividad_id = this.actividadId;
    }
  }
  
  cerrarModal() { this.showModal = false; }
}