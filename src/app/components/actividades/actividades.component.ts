import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActividadesService } from '../../services/actividades.service';
import { NavbarComponent } from "../navbar/navbar";

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

  nombre: any;
  descripcion: any;

  cupo: number = 0;
  cuota_valor: number = 0;
  estado: boolean = true;
  url_imagen: any;

  DataSourceUsuario: any;
  esAdmin = false;
  email = ''

  constructor(private actividadesService: ActividadesService) { }

  ngOnInit(): void {
    this.email = localStorage.getItem('email') || '';
    if (this.email) {
      this.CargarUsuario(this.email);
    } else {
      console.error("No se encontró un email en localStorage. No se puede cargar el usuario.");
    }
    this.CargarActividades();

  }

  CargarActividades() {
    this.isLoading = true;
    this.actividadesService.GetActividades().subscribe({
      next: (data: any) => {
        this.actividades = data;
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
      "url_imagen": this.url_imagen
    };

    this.actividadesService.CreateActividad(obj).subscribe({
      next: () => {
        console.log('Actividad creada con éxito');
        this.CargarActividades(); // Recargar la lista de actividades
        this.resetFormulario(); // Limpiar el formulario
      },
      error: (err) => console.error('Error al crear la actividad:', err)
    });
  }

  ModificarActividad() {
    if (!this.esAdmin) {
      console.error('Acción no permitida. El usuario no es administrador.');
      return;
    }

    // para asegurar que los valores sean numeros
    this.actividadParaEditar.cupo = Number(this.actividadParaEditar.cupo);
    this.actividadParaEditar.cuota_valor = Number(this.actividadParaEditar.cuota_valor);

    this.actividadesService.UpdateActividad(this.actividadParaEditar).subscribe({
      next: () => {
        console.log('Actividad modificada con éxito');
        this.CargarActividades(); // recarga la lista de actividades
        this.resetFormulario(); // limpia el formulario
        this.cerrarModal(); // y cierra el modal
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
        this.CargarActividades(); // recarga la lista de actividades
        this.cerrarModal(); // cierra el modal
      },
      error: (err) => console.error('Error al eliminar la actividad:', err)
    });
  }


  abrirModal(actividad: any, editMode: boolean = false) {
    this.selectedActividad = actividad;
    this.actividadParaEditar = { ...actividad }; // Clonar para edición
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
        console.log("Datos del usuario recibidos:", this.DataSourceUsuario);
      },
      error: (err) => {
        console.error("Error al cargar los datos del usuario:", err);
      }
    });
  }

  resetFormulario() {
    this.nombre = '';
    this.descripcion = '';
    this.cupo = 0;
    this.cuota_valor = 0;
    //this.estado = true;
    this.url_imagen = '';
  }
}
