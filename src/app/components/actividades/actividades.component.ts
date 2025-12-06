import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActividadesService } from '../../services/actividades.service';
import { UsuariosService } from '../../services/usuarios.service';
import { NavbarComponent } from "../navbar/navbar.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-actividades',
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './actividades.component.html',
  styleUrl: './actividades.component.css',
  standalone: true
})
export class ActividadesComponent implements OnInit {
  actividades: any[] = [];
  selectedActividad: any | null = null;
  isLoading = true;
  isEditMode = false;
  actividadParaEditar: any = {};
  actividadParaEliminar: any | null = null;
  entrenadorSeleccionado: number | null = null;

  isDarkMode = false;
  nombre: any;
  descripcion: any;
  listaEntrenadores: any[] = [];
  cupo: number = 0;
  cuota_valor: number = 0;
  estado: boolean = true;
  url_imagen: any;
  inicio: string = '';

  DataSourceUsuario: any;
  esAdmin = false;
  esUsuarioNormal = false;
  email = '';

  // Agregamos un array para guardar los IDs de las actividades donde ya está inscripto
  inscripcionesIds: number[] = [];

  constructor(
    private actividadesService: ActividadesService,
    private usuariosService: UsuariosService,
    private router: Router) { }

  ngOnInit(): void {
    this.email = localStorage.getItem('email') || '';
    if (this.email) {
      this.CargarUsuario(this.email);
    } else {
      console.error("No se encontró un email en localStorage. No se puede cargar el usuario.");
    }
    const darkModePref = localStorage.getItem('darkMode');
    this.isDarkMode = darkModePref === 'true';

    console.log("es usuario normal? ", this.esUsuarioNormal)
    this.CargarEntrenadores();
  }

  CargarActividades() {
    this.isLoading = true;
    this.actividadesService.GetActividades().subscribe({
      next: (data: any) => {
        this.actividades = data.map((actividad: any) => {
          if (!actividad.entrenador && actividad.entrenador_id) {
            const entrenador = this.listaEntrenadores.find(e => e.persona_id === actividad.entrenador_id);
            actividad.entrenador = entrenador ? `${entrenador.nombre} ${entrenador.apellido}` : 'No asignado';
          }
          return actividad;
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar actividades:', err);
        this.isLoading = false;
      }
    });
  }

  CrearActividad() {
    if (!this.esAdmin) {
      console.error('Acción no permitida. El usuario no es administrador.');
      return;
    }

    let obj = {
      "actividad_id": 0,
      "nombre": this.nombre,
      "descripcion": this.descripcion,
      "cupo": Number(this.cupo),
      "cuota_valor": Number(this.cuota_valor),
      "estado": this.estado,
      "url_imagen": this.url_imagen,
      "inicio": this.inicio ? Number(this.inicio.replace('-', '')) : null,
      "entrenador_id": this.entrenadorSeleccionado
    };

    this.actividadesService.CreateActividad(obj).subscribe({
      next: () => {
        console.log('Actividad creada con éxito');
        this.CargarActividades();
        this.resetFormulario();
      },
      error: (err) => console.error('Error al crear la actividad:', err)
    });
  }

  ModificarActividad() {
    if (!this.esAdmin) {
      console.error('Acción no permitida. El usuario no es administrador.');
      return;
    }

    this.actividadParaEditar.cupo = Number(this.actividadParaEditar.cupo);
    this.actividadParaEditar.cuota_valor = Number(this.actividadParaEditar.cuota_valor);

    this.actividadesService.UpdateActividad(this.actividadParaEditar).subscribe({
      next: () => {
        console.log('Actividad modificada con éxito');
        this.CargarActividades();
        this.resetFormulario();
        this.cerrarModal();
      },
      error: (err) => console.error('Error al modificar la actividad:', err)
    });
  }

  EliminarActividad(id: number) {
    if (!this.esAdmin) {
      console.error('Acción no permitida. El usuario no es administrador.');
      return;
    }

    this.actividadesService.DeleteActividad(id).subscribe({
      next: () => {
        console.log('Actividad eliminada con éxito');
        this.CargarActividades();
        this.actividadParaEliminar = null;
      },
      error: (err) => console.error('Error al eliminar la actividad:', err)
    });
  }

  CargarEntrenadores() {
    this.usuariosService.GetUsuariosByRol(2).subscribe((data: any) => {
      this.listaEntrenadores = data.filter((u: any) => u.rol_id === 2);
      this.CargarActividades();
    });
  }

  solicitarConfirmacionEliminar(actividad: any) {
    this.actividadParaEliminar = actividad;
  }

  cancelarEliminacion() {
    this.actividadParaEliminar = null;
  }

  abrirModal(actividad: any, editMode: boolean = false) {
    this.selectedActividad = actividad;
    this.actividadParaEditar = { ...actividad };
    this.isEditMode = editMode;
  }

  cerrarModal() {
    this.selectedActividad = null;
    this.isEditMode = false;
    this.actividadParaEditar = {};
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
  }

  CargarUsuario(email: string) {
    this.actividadesService.GetUsuario(email).subscribe({
      next: (x) => {
        this.DataSourceUsuario = x;
        this.esAdmin = this.DataSourceUsuario?.rol_id === 1;
        this.esUsuarioNormal = this.DataSourceUsuario?.rol_id === 3;

        if (this.esAdmin) {
          this.CargarEntrenadores();
        }

        // Si es usuario normal, cargamos sus inscripciones para verificar duplicados
        if (this.esUsuarioNormal) {
          this.CargarInscripciones();
        }
      },
      error: (err) => {
        console.error("Error al cargar los datos del usuario:", err);
      }
    });
  }

  // Método nuevo para obtener inscripciones
  CargarInscripciones() {
    this.actividadesService.GetInscripcionesUsuario(this.email).subscribe({
      next: (res: any) => {
        if (res) {
          // Guardamos solo los IDs de las actividades
          this.inscripcionesIds = res.map((i: any) => i.actividad_id);
        }
      },
      error: (err) => console.error('Error cargando inscripciones:', err)
    });
  }

  // Helper para verificar si ya está inscripto
  estaInscripto(actividadId: number): boolean {
    return this.inscripcionesIds.includes(actividadId);
  }

  Inscribirse(actividad_id: number) {
    this.router.navigate(['/inscripcion'], {
      state: {
        actividadId: actividad_id
      }
    });
  }

  resetFormulario() {
    this.nombre = '';
    this.descripcion = '';
    this.cupo = 0;
    this.cuota_valor = 0;
    this.inicio = '';
    this.url_imagen = '';
  }
}