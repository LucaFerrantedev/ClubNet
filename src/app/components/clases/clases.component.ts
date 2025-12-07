import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClasesService } from '../../services/clases.service';
import { ActividadesService } from '../../services/actividades.service';
import { NavbarComponent } from '../navbar/navbar.component';

// MODIFICADO: Agregamos 'id' a la interfaz para poder filtrar
interface GrupoClases {
  id: number;
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
  
  esEntrenador = false;
  actividadId: number | null = null; 
  
  actividadesDelEntrenador: any[] = []; 
  
  // NUEVO: Lista de actividades donde está inscripto el usuario (para el select)
  inscripcionesUsuario: any[] = [];
  
  // NUEVO: Variable específica para el filtro del usuario
  filtroUsuarioId: number | null = null;

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

    this.route.queryParams.subscribe(params => {
      this.actividadId = params['actividadId'] ? Number(params['actividadId']) : null;
      
      // Si llega un ID por URL, lo usamos como filtro inicial
      if(this.actividadId) {
        this.filtroUsuarioId = this.actividadId;
      }

      if (this.email) {
        this.verificarUsuarioYRol();
      } else {
        this.isLoading = false;
      }
    });
  }

  verificarUsuarioYRol() {
    this.clasesService.GetUsuario(this.email).subscribe({
      next: (user: any) => {
        this.esEntrenador = user?.rol_id === 2;

        if (this.esEntrenador) {
          this.cargarActividadesAsignadas(user.persona_id);
          
          if (this.actividadId) {
            this.cargarClasesActividad(this.actividadId);
            this.nuevaClase.actividad_id = this.actividadId;
          } else {
            this.isLoading = false; 
          }
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
        this.actividadesDelEntrenador = data.filter((a: any) => a.entrenador_id === personaId);
      }
    });
  }

  cargarClasesActividad(id: number) {
    this.isLoading = true;
    this.actividadId = id; 
    this.clasesService.GetClases(id).subscribe({
      next: (data: any) => {
        this.clasesEntrenador = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  cambiarActividadVisualizada(id: number) {
    this.cargarClasesActividad(id);
  }

  crearClase() {
    if (!this.nuevaClase.actividad_id) {
      alert("Por favor selecciona una actividad.");
      return;
    }

    const actividadSeleccionada = this.actividadesDelEntrenador.find(
      a => a.actividad_id === this.nuevaClase.actividad_id
    );

    const obj = {
      Actividad_id: this.nuevaClase.actividad_id, 
      Actividad: actividadSeleccionada ? actividadSeleccionada.nombre : 'Sin Nombre', 
      Titulo: this.nuevaClase.titulo,
      Detalle: this.nuevaClase.detalle,
      Intensidad: this.nuevaClase.intensidad,
      Url_multimedia: this.nuevaClase.url_multimedia
    };

    this.clasesService.CreateClase(obj).subscribe({
      next: () => {
        if (this.actividadId === this.nuevaClase.actividad_id) {
          this.cargarClasesActividad(this.actividadId);
        }
        this.cerrarModal();
        this.nuevaClase = { 
          actividad_id: this.nuevaClase.actividad_id, 
          actividad: '', 
          titulo: '', 
          detalle: '', 
          intensidad: '', 
          url_multimedia: '' 
        };
      },
      error: (err) => console.error("Error creando clase", err)
    });
  }

  // --- Lógica USUARIO NORMAL ---
  cargarMisClases() {
    this.actividadesService.GetInscripcionesUsuario(this.email).subscribe({
      next: (inscripciones: any) => {
        if (Array.isArray(inscripciones) && inscripciones.length > 0) {
          
          // Guardamos las inscripciones para llenar el selector
          this.inscripcionesUsuario = inscripciones;

          // Cargamos SIEMPRE todas las clases para permitir filtrado rápido en cliente
          let solicitudesCompletadas = 0;
          inscripciones.forEach((ins: any) => {
            this.clasesService.GetClases(ins.actividad_id).subscribe({
              next: (clases: any) => {
                if (Array.isArray(clases) && clases.length > 0) {
                  this.misClases.push({
                    id: ins.actividad_id, // Guardamos ID para filtrar
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

  // NUEVO: Getter para filtrar la vista sin recargar datos
  get clasesFiltradasUsuario() {
    if (!this.filtroUsuarioId) {
      return this.misClases;
    }
    return this.misClases.filter(g => g.id === this.filtroUsuarioId);
  }

  abrirModal() { 
    this.showModal = true;
    if (this.actividadId) {
        this.nuevaClase.actividad_id = this.actividadId;
    }
  }
  
  cerrarModal() { this.showModal = false; }
}