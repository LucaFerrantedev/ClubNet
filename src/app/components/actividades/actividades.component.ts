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
  esEntrenador = false; // NUEVO
  email = '';
  inscripcionesIds: number[] = [];

  constructor(
    private actividadesService: ActividadesService,
    private usuariosService: UsuariosService,
    private router: Router) { }

  ngOnInit(): void {
    this.email = localStorage.getItem('email') || '';
    if (this.email) {
      this.CargarUsuario(this.email);
    }
    const darkModePref = localStorage.getItem('darkMode');
    this.isDarkMode = darkModePref === 'true';
  }

  // ... (CargarActividades, CrearActividad, ModificarActividad, EliminarActividad, CargarEntrenadores sin cambios)
  // Asegúrate de mantener todos los métodos existentes del paso anterior.
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
      error: (err) => { this.isLoading = false; }
    });
  }
  
  // ... Métodos CRUD (Crear, Modificar, Eliminar) igual que antes ...
  CrearActividad() {
    // ... tu código existente ...
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
      next: () => { this.CargarActividades(); this.resetFormulario(); },
      error: (err) => console.error(err)
    });
  }

  ModificarActividad() {
     // ... tu código existente ...
     this.actividadParaEditar.cupo = Number(this.actividadParaEditar.cupo);
     this.actividadParaEditar.cuota_valor = Number(this.actividadParaEditar.cuota_valor);
     this.actividadesService.UpdateActividad(this.actividadParaEditar).subscribe({
      next: () => { this.CargarActividades(); this.resetFormulario(); this.cerrarModal(); },
      error: (err) => console.error(err)
    });
  }

  EliminarActividad(id: number) {
     // ... tu código existente ...
     this.actividadesService.DeleteActividad(id).subscribe({
      next: () => { this.CargarActividades(); this.actividadParaEliminar = null; },
      error: (err) => console.error(err)
    });
  }

  CargarEntrenadores() {
    this.usuariosService.GetUsuariosByRol(2).subscribe((data: any) => {
       this.listaEntrenadores = data.filter((u: any) => u.rol_id === 2);
       this.CargarActividades(); 
    });
  }
  
  // Modales
  solicitarConfirmacionEliminar(actividad: any) { this.actividadParaEliminar = actividad; }
  cancelarEliminacion() { this.actividadParaEliminar = null; }
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
  toggleEditMode(): void { this.isEditMode = !this.isEditMode; }

  // ACTUALIZADO: Lógica de carga de usuario y roles
  CargarUsuario(email: string) {
    this.actividadesService.GetUsuario(email).subscribe({
      next: (x) => {
        this.DataSourceUsuario = x;
        this.esAdmin = this.DataSourceUsuario?.rol_id === 1;
        this.esEntrenador = this.DataSourceUsuario?.rol_id === 2; // NUEVO
        this.esUsuarioNormal = this.DataSourceUsuario?.rol_id === 3;

        if (this.esAdmin) {
          this.CargarEntrenadores(); // Carga entrenadores y luego actividades
        } else {
          this.CargarActividades(); // Si no es admin, cargamos actividades directo
          if (this.esUsuarioNormal) {
            this.CargarInscripciones();
          }
        }
      },
      error: (err) => console.error("Error usuario:", err)
    });
  }

  CargarInscripciones() {
    this.actividadesService.GetInscripcionesUsuario(this.email).subscribe({
      next: (res: any) => { if (res) this.inscripcionesIds = res.map((i: any) => i.actividad_id); }
    });
  }

  estaInscripto(actividadId: number): boolean {
    return this.inscripcionesIds.includes(actividadId);
  }

  Inscribirse(actividad_id: number) {
    this.router.navigate(['/inscripcion'], { state: { actividadId: actividad_id } });
  }

  // NUEVO: Método para que el entrenador vaya a gestionar clases
  VerClases(id: number) {
    this.router.navigate(['/clases'], { queryParams: { actividadId: id } });
  }

  resetFormulario() {
    this.nombre = ''; this.descripcion = ''; this.cupo = 0; this.cuota_valor = 0;
    this.inicio = ''; this.url_imagen = '';
  }
}