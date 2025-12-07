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
  misClases: GrupoClases[] = [];
  clasesEntrenador: any[] = [];
  
  isLoading = true;
  isDarkMode = false;
  email = '';
  
  esEntrenador = false;
  actividadId: number | null = null; 
  
  actividadesDelEntrenador: any[] = []; 
  inscripcionesUsuario: any[] = [];
  filtroUsuarioId: number | null = null;

  // Modelo actualizado para incluir clase_id (opcional para creación)
  nuevaClase: any = { 
    clase_id: 0, 
    actividad_id: 0, 
    actividad: '', 
    titulo: '', 
    detalle: '', 
    intensidad: '', 
    url_multimedia: '' 
  };

  showModal = false;
  isEditMode = false; // Bandera para saber si editamos
  claseParaEliminar: any | null = null; // Para el modal de borrar

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

  // Método unificado para guardar (Crear o Editar)
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
    };

    this.clasesService.CreateClase(obj).subscribe({
      next: () => { this.finalizarAccion(); },
      error: (err) => console.error("Error creando clase", err)
    });
  }

  actualizarClase() {
    // Buscar nombre de actividad por si cambió
    const actividadSeleccionada = this.actividadesDelEntrenador.find(a => a.actividad_id === this.nuevaClase.actividad_id);
    
    const obj = {
      Clase_id: this.nuevaClase.clase_id, // Necesario para el Update
      Actividad: actividadSeleccionada ? actividadSeleccionada.nombre : 'Sin Nombre',
      Titulo: this.nuevaClase.titulo,
      Detalle: this.nuevaClase.detalle,
      Intensidad: this.nuevaClase.intensidad,
      Url_multimedia: this.nuevaClase.url_multimedia
    };

    this.clasesService.UpdateClase(obj).subscribe({
      next: () => { 
        console.log("Clase actualizada");
        this.finalizarAccion(); 
      },
      error: (err) => console.error("Error actualizando", err)
    });
  }

  // Confirmación de eliminación
  solicitarConfirmacionEliminar(clase: any) {
    this.claseParaEliminar = clase;
  }

  cancelarEliminacion() {
    this.claseParaEliminar = null;
  }

  eliminarClase() {
    if (!this.claseParaEliminar) return;

    this.clasesService.DeleteClase(this.claseParaEliminar.clase_id).subscribe({
      next: () => {
        // Recargar si estamos viendo esa actividad
        if (this.actividadId) this.cargarClasesActividad(this.actividadId);
        this.claseParaEliminar = null;
      },
      error: (err) => console.error("Error eliminando", err)
    });
  }

// --- Helpers ---
  finalizarAccion() {
    // Si la clase modificada corresponde a la actividad visualizada, recargar lista
    if (this.actividadId === this.nuevaClase.actividad_id) {
      // CORRECCIÓN: Usamos this.nuevaClase.actividad_id que seguro es number, o el '!'
      this.cargarClasesActividad(this.nuevaClase.actividad_id);
    }
    this.cerrarModal();
    this.resetForm();
  }

  resetForm() {
    this.nuevaClase = { 
      clase_id: 0,
      actividad_id: this.actividadId || 0, // Mantener selección actual si existe
      actividad: '', 
      titulo: '', 
      detalle: '', 
      intensidad: '', 
      url_multimedia: '' 
    };
  }

  // --- Lógica USUARIO NORMAL ---
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

  // Abrir modal: Si recibe 'clase', es edición. Si no, es creación.
  abrirModal(clase: any = null) { 
    this.showModal = true;
    if (clase) {
      this.isEditMode = true;
      // Copiamos los datos para no modificar la tabla en tiempo real antes de guardar
      this.nuevaClase = { ...clase };
    } else {
      this.isEditMode = false;
      this.resetForm();
    }
  }
  
  cerrarModal() { 
    this.showModal = false;
    this.isEditMode = false;
  }
}