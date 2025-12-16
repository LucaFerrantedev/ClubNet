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
  
  private actividadesService = inject(ActividadesService);
  public loginService = inject(LoginService);
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);

  actividades: Actividad[] = [];
  listaEntrenadores: any[] = [];
  inscripcionesIds: number[] = [];
  
  isLoading = true;
  isEditMode = false;
  isDarkMode = false;

  actividadForm: Actividad = this.initActividad();
  selectedActividad: Actividad | null = null;
  actividadParaEliminar: Actividad | null = null;

  // Variables para Comunicados
  showComunicadoModal = false;
  comunicadoData = {
    asunto: '',
    detalle: ''
  };
  actividadParaComunicado: Actividad | null = null;

  get esAdmin() { return this.loginService.currentUser()?.rol_id === 1; }
  get esEntrenador() { return this.loginService.currentUser()?.rol_id === 2; }
  get esUsuarioNormal() { return this.loginService.currentUser()?.rol_id === 3; }

  ngOnInit(): void {
    const darkModePref = localStorage.getItem('darkMode');
    this.isDarkMode = darkModePref === 'true';
    this.CargarDatos();
  }

  CargarDatos() {
    this.isLoading = true;
    const email = localStorage.getItem('email');
    if (!this.loginService.currentUser() && email) {
        this.loginService.loadUser(email);
    }

    if (this.esAdmin) {
      this.CargarEntrenadores();
    } else {
      this.CargarActividades();
      if (this.esUsuarioNormal && email) {
        this.CargarInscripciones(email);
      }
    }
  }

  CargarActividades() {
    // Obtenemos el ID del usuario actual si es entrenador
    let entrenadorId: number | undefined;

    if (this.esEntrenador) {
      // loginService.currentUser() trae los datos del usuario logueado
      entrenadorId = this.loginService.currentUser()?.persona_id;
    }

    // Llamamos al servicio pasando el ID (será undefined si es Admin o Usuario normal)
    this.actividadesService.GetActividades(entrenadorId).subscribe({
      next: (res) => {
        const datos = res.data || (Array.isArray(res) ? res : []);
        
        this.actividades = datos.map((act) => {
          // Lógica existente para mapear nombres...
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
    this.usuariosService.GetUsuariosByRol(2).subscribe((data: any) => {
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

  GuardarActividad() {
    const payload = { ...this.actividadForm };
    payload.cupo = Number(payload.cupo);
    payload.cuota_valor = Number(payload.cuota_valor);
    
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

  abrirModal(actividad?: Actividad, editMode: boolean = false) {
    this.isEditMode = editMode;
    if (actividad) {
      this.selectedActividad = actividad;
      this.actividadForm = { ...actividad };
      if (this.actividadForm.inicio) {
          const inicioStr = this.actividadForm.inicio.toString();
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

  Inscribirse(actividad_id: number) {
    this.router.navigate(['/inscripcion'], { state: { actividadId: actividad_id } });
  }

  VerClases(id: number) {
    this.router.navigate(['/clases'], { queryParams: { actividadId: id } });
  }

  estaInscripto(actividadId: number): boolean {
    return this.inscripcionesIds.includes(actividadId);
  }

  // --- Lógica Modal Comunicados ---

  abrirModalComunicado(actividad: Actividad) {
    this.actividadParaComunicado = actividad;
    this.comunicadoData = { asunto: '', detalle: '' };
    this.showComunicadoModal = true;
  }

  cerrarModalComunicado() {
    this.showComunicadoModal = false;
    this.actividadParaComunicado = null;
  }

  enviarComunicado() {
    if (!this.actividadParaComunicado || !this.comunicadoData.asunto || !this.comunicadoData.detalle) {
      alert('Asunto y Detalle son obligatorios'); 
      return;
    }

    const payload = {
      actividad_id: this.actividadParaComunicado.actividad_id,
      entrenador_id: this.loginService.currentUser()?.persona_id || 0,
      asunto: this.comunicadoData.asunto,
      detalle: this.comunicadoData.detalle
    };

    this.actividadesService.CrearComunicado(payload).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Comunicado enviado con éxito');
          this.cerrarModalComunicado();
        } else {
          alert('Error al enviar: ' + res.message);
        }
      },
      error: () => alert('Error de conexión')
    });
  }

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