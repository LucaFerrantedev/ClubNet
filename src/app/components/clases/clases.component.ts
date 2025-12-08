import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClasesService } from '../../services/clases.service';
import { ActividadesService } from '../../services/actividades.service';
import { NavbarComponent } from '../navbar/navbar.component';

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
  // --- Estado de Datos ---
  misClases: GrupoClases[] = [];
  clasesEntrenador: any[] = [];
  
  // --- Estado de UI ---
  isLoading = true;
  isDarkMode = false;
  email = '';
  
  // --- Roles y Filtros ---
  esEntrenador = false;
  actividadId: number | null = null; 
  actividadNombreActual: string = ''; // Para mostrar en el título
  
  actividadesDelEntrenador: any[] = []; 
  inscripcionesUsuario: any[] = [];
  filtroUsuarioId: number | null = null;

  // --- Modelo de Clase (Fusionado) ---
  nuevaClase: any = { 
    clase_id: 0, 
    actividad_id: this.actividadId, 
    actividad: '', 
    titulo: '', 
    detalle: '', 
    intensidad: 'BAJA', // Valor por defecto para que el select se vea bien
    url_multimedia: '',
    videoFile: null // Agregado para soportar tu input de archivo visualmente
  };

  selectedVideoName = ''; // Para mostrar el nombre del archivo seleccionado (UI)
  showModal = false;
  isEditMode = false;
  claseParaEliminar: any | null = null;

  videoVisibleId: number | null = null;

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
      if(this.actividadId) this.filtroUsuarioId = this.actividadId;

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
        // Intentar setear el nombre de la actividad actual
        if (this.actividadId) {
            const act = this.actividadesDelEntrenador.find(a => a.actividad_id === this.actividadId);
            if(act) this.actividadNombreActual = act.nombre;
        }
      }
    });
  }

  cargarClasesActividad(id: number) {
    this.isLoading = true;
    this.actividadId = id; 
    
    // Actualizar nombre visual
    const act = this.actividadesDelEntrenador.find(a => a.actividad_id === id);
    if(act) this.actividadNombreActual = act.nombre;

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
    // Actualizamos el ID en el objeto de creación por si quiere crear una clase ahí mismo
    this.nuevaClase.actividad_id = id;
  }

  // --- Helpers Visuales (Traídos de _mio) ---
  
  // Clase CSS según intensidad
  getIntensidadClass(intensidad: string | undefined): string {
    switch ((intensidad || '').toUpperCase()) {
      case 'ALTA': return 'intensidad-alta';
      case 'MEDIA': return 'intensidad-media';
      case 'BAJA': return 'intensidad-baja';
      default: return '';
    }
  }

  // Manejo de Archivo (Visual)
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.selectedVideoName = file.name;
    
    this.clasesService.UploadVideo(file).subscribe({
    next: (res: any) => {
      console.log(res.data);
      this.nuevaClase.url_multimedia = res.data;  
    },
    error: (err) => {
      console.error('Error subiendo video', err);
    }
  });
  }

  // Función para alternar la visibilidad
  toggleVideo(id: number, event: Event) {
    event.stopPropagation(); // IMPORTANTE: Para que no se abra el modal de edición/click de la fila
    
    if (this.videoVisibleId === id) {
      this.videoVisibleId = null; // Si ya está abierto, lo cerramos
    } else {
      this.videoVisibleId = id; // Abrimos este
    }
  }

  // --- ABM (CRUD) ---

  guardarClase() {
    if (!this.nuevaClase.actividad_id) {
      alert("Por favor selecciona una actividad.");
      return;
    }

    if (this.isEditMode) {
      this.actualizarClase();
    } else {
      this.crearClase();
    }
  }

  crearClase() {
    const actividadSeleccionada = this.actividadesDelEntrenador.find(a => a.actividad_id === this.nuevaClase.actividad_id);
    const obj = {
      Actividad_id: this.nuevaClase.actividad_id, 
      Actividad: actividadSeleccionada ? actividadSeleccionada.nombre : 'Sin Nombre', 
      Titulo: this.nuevaClase.titulo,
      Detalle: this.nuevaClase.detalle,
      Intensidad: this.nuevaClase.intensidad,
      Url_multimedia: this.nuevaClase.url_multimedia
      // Nota: Aquí se enviaría el archivo si el servicio lo soportara
    };

    this.clasesService.CreateClase(obj).subscribe({
      next: () => { this.finalizarAccion(); },
      error: (err) => console.error("Error creando clase", err)
    });
  }

  actualizarClase() {
    const actividadSeleccionada = this.actividadesDelEntrenador.find(a => a.actividad_id === this.nuevaClase.actividad_id);
    
    const obj = {
      Clase_id: this.nuevaClase.clase_id, 
      Actividad: actividadSeleccionada ? actividadSeleccionada.nombre : 'Sin Nombre',
      Titulo: this.nuevaClase.titulo,
      Detalle: this.nuevaClase.detalle,
      Intensidad: this.nuevaClase.intensidad,
      Url_multimedia: this.nuevaClase.url_multimedia
    };

    this.clasesService.UpdateClase(obj).subscribe({
      next: () => { 
        this.finalizarAccion(); 
      },
      error: (err) => console.error("Error actualizando", err)
    });
  }

  solicitarConfirmacionEliminar(clase: any, event: Event) {
    event.stopPropagation(); // Para que no abra el modal de editar al hacer click en borrar
    this.claseParaEliminar = clase;
  }

  cancelarEliminacion() {
    this.claseParaEliminar = null;
  }

  eliminarClase() {
    if (!this.claseParaEliminar) return;

    this.clasesService.DeleteClase(this.claseParaEliminar.clase_id).subscribe({
      next: () => {
        if (this.actividadId) this.cargarClasesActividad(this.actividadId);
        this.claseParaEliminar = null;
      },
      error: (err) => console.error("Error eliminando", err)
    });
  }

  finalizarAccion() {
    if (this.actividadId === this.nuevaClase.actividad_id) {
      this.cargarClasesActividad(this.nuevaClase.actividad_id);
    }
    this.cerrarModal();
    this.resetForm();
  }

  resetForm() {
    this.nuevaClase = { 
      clase_id: 0,
      actividad_id: this.actividadId || 0, 
      actividad: '', 
      titulo: '', 
      detalle: '', 
      intensidad: null, 
      url_multimedia: '',
      videoFile: null
    };
    this.selectedVideoName = '';
  }

  // --- Lógica USUARIO NORMAL (Sin cambios visuales mayores) ---
  cargarMisClases() {
    this.actividadesService.GetInscripcionesUsuario(this.email).subscribe({
      next: (inscripciones: any) => {
        if (Array.isArray(inscripciones) && inscripciones.length > 0) {
          this.inscripcionesUsuario = inscripciones;
          let solicitudesCompletadas = 0;
          inscripciones.forEach((ins: any) => {
            this.clasesService.GetClases(ins.actividad_id).subscribe({
              next: (clases: any) => {
                if (Array.isArray(clases) && clases.length > 0) {
                  this.misClases.push({
                    id: ins.actividad_id,
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

  get clasesFiltradasUsuario() {
    if (!this.filtroUsuarioId) return this.misClases;
    return this.misClases.filter(g => g.id === this.filtroUsuarioId);
  }

  // --- Manejo del Modal ---
  abrirModal(clase: any = null) { 
    this.showModal = true;
    if (clase) {
      this.isEditMode = true;
      this.nuevaClase = { ...clase };
      this.selectedVideoName = clase.url_multimedia ? 'Video cargado previamente' : '';
    } else {
      this.isEditMode = false;
      this.resetForm();
      // Si ya tenemos una actividad seleccionada, pre-seleccionarla
      if(this.actividadId) this.nuevaClase.actividad_id = this.actividadId;
    }
  }
  
  cerrarModal() { 
    this.showModal = false;
    this.isEditMode = false;
  }
}