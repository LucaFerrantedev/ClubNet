import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";
import { ActividadesService, Actividad } from '../../services/actividades.service';
import { LoginService } from '../../services/login.service';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-actividades',
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './actividades.component.html',
  styleUrl: './actividades.component.css',
  standalone: true
})
export class ActividadesComponent implements OnInit {
  
  // Inyección de dependencias moderna
  private actividadesService = inject(ActividadesService);
  public loginService = inject(LoginService); // Público para usar en el HTML
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);

  // Estado del componente
  actividades: Actividad[] = [];
  listaEntrenadores: any[] = [];
  inscripcionesIds: number[] = [];
  
  isLoading = true;
  isEditMode = false;
  isDarkMode = false; // Se podría mover a un ThemeService global

  // Formularios y selección
  actividadForm: Actividad = this.initActividad();
  selectedActividad: Actividad | null = null;
  actividadParaEliminar: Actividad | null = null;

  // Getters para roles (Usan el Signal de LoginService, ¡Reactivo!)
  get esAdmin() { return this.loginService.currentUser()?.rol_id === 1; }
  get esEntrenador() { return this.loginService.currentUser()?.rol_id === 2; }
  get esUsuarioNormal() { return this.loginService.currentUser()?.rol_id === 3; }

  ngOnInit(): void {
    // Manejo de tema oscuro
    const darkModePref = localStorage.getItem('darkMode');
    this.isDarkMode = darkModePref === 'true';

    // Carga inicial de datos
    this.CargarDatos();
  }

  CargarDatos() {
    this.isLoading = true;
    
    // Si el usuario no está en el Signal, intentamos cargarlo (fallback)
    const email = localStorage.getItem('email');
    if (!this.loginService.currentUser() && email) {
        this.loginService.loadUser(email);
    }

    // Lógica condicional basada en roles
    if (this.esAdmin) {
      this.CargarEntrenadores(); // Carga entrenadores y luego actividades
    } else {
      this.CargarActividades();
      if (this.esUsuarioNormal && email) {
        this.CargarInscripciones(email);
      }
    }
  }

  CargarActividades() {
    this.actividadesService.GetActividades().subscribe({
      next: (res) => {
        // Mapeo seguro de datos
        const datos = res.data || (Array.isArray(res) ? res : []);
        
        this.actividades = datos.map((act) => {
          // Lógica de presentación para nombre de entrenador
          if (!act.ent_nombre && act.entrenador_id) {
            const entrenador = this.listaEntrenadores.find(e => e.persona_id === act.entrenador_id);
            if (entrenador) {
                act.ent_nombre = entrenador.nombre;
                act.ent_apellido = entrenador.apellido;
            }
          }
          return act;
        });
        this.isLoading = false;
      },
      error: (err) => { 
        console.error(err); 
        this.isLoading = false; 
      }
    });
  }

  CargarEntrenadores() {
    // Asumimos que UsuariosService también se refactorizará para devolver tipos, por ahora any
    this.usuariosService.GetUsuariosByRol(2).subscribe((data: any) => {
       // Filtramos o asignamos directamente dependiendo de la respuesta de tu API
       this.listaEntrenadores = Array.isArray(data) ? data : (data.data || []);
       this.CargarActividades(); 
    });
  }

  CargarInscripciones(email: string) {
    this.actividadesService.GetInscripcionesUsuario(email).subscribe({
      next: (res: any) => { 
        const datos = res.data || (Array.isArray(res) ? res : []);
        this.inscripcionesIds = datos.map((i: any) => i.actividad_id); 
      }
    });
  }

  // --- Lógica CRUD Unificada ---

  GuardarActividad() {
    // Preparamos los datos (conversion de tipos si el HTML devuelve strings)
    const payload = { ...this.actividadForm };
    payload.cupo = Number(payload.cupo);
    payload.cuota_valor = Number(payload.cuota_valor);
    
    // Si 'inicio' viene como 'YYYY-MM', lo convertimos a número YYYYMM
    if (typeof payload.inicio === 'string') {
        payload.inicio = Number((payload.inicio as string).replace('-', ''));
    }

    const request = this.isEditMode 
        ? this.actividadesService.UpdateActividad(payload)
        : this.actividadesService.CreateActividad(payload);

    request.subscribe({
        next: () => {
            this.CargarActividades();
            this.cerrarModal();
        },
        error: (err) => console.error("Error al guardar:", err)
    });
  }

  EliminarActividad() {
    if (!this.actividadParaEliminar) return;
    
    this.actividadesService.DeleteActividad(this.actividadParaEliminar.actividad_id).subscribe({
      next: () => { 
        this.CargarActividades(); 
        this.actividadParaEliminar = null; 
      },
      error: (err) => console.error(err)
    });
  }

  // --- Helpers de UI ---

  abrirModal(actividad?: Actividad, editMode: boolean = false) {
    this.isEditMode = editMode;
    if (actividad) {
      this.selectedActividad = actividad;
      // Copia para editar sin afectar la vista tabla
      this.actividadForm = { ...actividad };
      
      // Formatear fecha para el input type="month" (YYYYMM -> YYYY-MM)
      if (this.actividadForm.inicio) {
          const inicioStr = this.actividadForm.inicio.toString();
          // Hack rápido para que el input lo lea
          (this.actividadForm.inicio as any) = `${inicioStr.substring(0, 4)}-${inicioStr.substring(4, 6)}`;
      }
    } else {
      this.actividadForm = this.initActividad();
    }
  }

  cerrarModal() {
    this.selectedActividad = null;
    this.isEditMode = false;
    this.actividadForm = this.initActividad();
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  solicitarConfirmacionEliminar(actividad: Actividad) {
    this.actividadParaEliminar = actividad;
  }

  cancelarEliminacion() {
    this.actividadParaEliminar = null;
  }

  // Navegación
  Inscribirse(actividad_id: number) {
    this.router.navigate(['/inscripcion'], { state: { actividadId: actividad_id } });
  }

  VerClases(id: number) {
    this.router.navigate(['/clases'], { queryParams: { actividadId: id } });
  }

  estaInscripto(actividadId: number): boolean {
    return this.inscripcionesIds.includes(actividadId);
  }

  // Factory para objeto vacío
  private initActividad(): Actividad {
    return {
      actividad_id: 0,
      nombre: '',
      descripcion: '',
      cupo: 0,
      cuota_valor: 0,
      estado: true,
      url_imagen: '',
      inicio: 0,
      entrenador_id: null
    };
  }
}