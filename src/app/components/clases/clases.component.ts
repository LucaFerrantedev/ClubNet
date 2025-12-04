import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClasesService } from '../../services/clases.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';

type Intensidad = 'ALTA' | 'MEDIA' | 'BAJA';

interface Clase {
  clase_id: number;
  titulo: string;
  detalle: string;
  intensidad: Intensidad | string;
  videoFile?: File | null;
}

@Component({
  selector: 'app-clases',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './clases.component.html',
  styleUrl: './clases.component.css'
})
export class ClasesComponent implements OnInit {
  clases: Clase[] = [];
  claseEnEdicion: Clase | null = null;
  selectedVideoName = '';
  mostrarModal = false;

  isLoading = true;
  isDarkMode = false;

  constructor(private clasesService: ClasesService) {}

  ngOnInit(): void {
    // Cargar preferencia de modo oscuro
    const darkModePref = localStorage.getItem('darkMode');
    this.isDarkMode = darkModePref === 'true';

    this.clasesService.GetClases(2).subscribe({
      next: (data: any) => {
        this.clases = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar las clases:', err);
        this.isLoading = false;
      }
    });
  }

  // Click en fila → abrir modal con edición
  seleccionarClase(clase: Clase): void {
    // clonar para no tocar directamente la lista
    this.claseEnEdicion = { ...clase };
    this.selectedVideoName = clase.videoFile ? clase.videoFile.name : '';
    this.mostrarModal = true;
  }

  // Click en "+ Crear clase" → abrir modal vacío
  crearNuevaClase(): void {
    this.claseEnEdicion = {
      clase_id: 0,
      titulo: '',
      detalle: '',
      intensidad: 'BAJA',
      videoFile: null
    };
    this.selectedVideoName = '';
    this.mostrarModal = true;
  }

  // Clase CSS según intensidad (para etiqueta y select)
  getIntensidadClass(intensidad: Intensidad | string | undefined): string {
    switch ((intensidad || '').toUpperCase()) {
      case 'ALTA':
        return 'intensidad-alta';
      case 'MEDIA':
        return 'intensidad-media';
      case 'BAJA':
        return 'intensidad-baja';
      default:
        return '';
    }
  }

  // Archivo de video
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.selectedVideoName = file.name;

    if (this.claseEnEdicion) {
      this.claseEnEdicion.videoFile = file;
    }
  }

  // Cerrar modal sin guardar
  cerrarModal(): void {
    this.mostrarModal = false;
    this.claseEnEdicion = null;
    this.selectedVideoName = '';
  }

  cancelarEdicion(): void {
    this.cerrarModal();
  }

  // Guardar cambios (alta o edición) y cerrar modal
  guardarCambios(): void {
    if (!this.claseEnEdicion) return;

    if (this.claseEnEdicion.clase_id === 0) {
      // Nueva clase
      const nuevoId =
        (this.clases.length
          ? Math.max(...this.clases.map((c) => c.clase_id as number))
          : 0) + 1;

      const nueva: Clase = { ...this.claseEnEdicion, clase_id: nuevoId };
      this.clases = [...this.clases, nueva];
    } else {
      // Edición de existente
      this.clases = this.clases.map((c) =>
        c.clase_id === this.claseEnEdicion!.clase_id
          ? { ...this.claseEnEdicion! }
          : c
      );
    }

    this.cerrarModal();
  }
}
