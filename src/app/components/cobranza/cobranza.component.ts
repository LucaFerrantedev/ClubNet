import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { CobranzaService } from '../../services/cobranza.service';
import { ActividadesService } from '../../services/actividades.service';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-cobranza',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './cobranza.component.html',
  styleUrl: './cobranza.component.css'
})
export class CobranzaComponent implements OnInit {
  id:any;
  email: string = '';
  DataSourceUsuario: any;
  
  cobros: any[] = [];       
  cobrosFiltrados: any[] = []; 
  actividades: any[] = [];  
  
  isLoading = true;
  esAdmin = false;
  isDarkMode = false;
  miPersonaId: number | null = null;

  filtroTexto: string = '';
  filtroEstado: string = 'TODOS';
  filtroActividad: any = 'TODAS';

  // Objeto para el cartel de resumen
  resumenUsuario = {
    vencidos: 0,
    pendientes: 0,
    totalDeuda: 0
  };

  constructor(
    private cobranzaService: CobranzaService,
    private actividadesService: ActividadesService,
    private userService:UsuariosService
  ) {}

  ngOnInit(): void {
    this.email = localStorage.getItem('email') || '';
    
    if (this.email) {
      this.CargarUsuario(this.email);
    } else {
      console.error("No se encontró un email en localStorage.");
      this.isLoading = false;
    }

    // Cargar preferencia de modo oscuro
    const darkModePref = localStorage.getItem('darkMode');
    this.isDarkMode = darkModePref === 'true';
    this.applyDarkMode();
  }

  CargarUsuario(email: string) {
    this.actividadesService.GetUsuario(email).subscribe({
      next: (x) => {
        this.DataSourceUsuario = x;
        this.esAdmin = this.DataSourceUsuario?.rol_id === 1;
        
        // Guardamos el ID de la persona logueada
        this.miPersonaId = this.DataSourceUsuario?.persona_id; 

        // Cargamos datos DESPUÉS de saber quién es
        this.cargarDatos(); 
        
        if (this.esAdmin) {
          this.cargarComboActividades();
        }
      },
      error: (err) => {
        console.error("Error al cargar los datos del usuario:", err);
        this.isLoading = false;
      }
    });
  }

  cargarDatos() {
    this.isLoading = true;

    const idPersonaParaBuscar = this.esAdmin ? null : this.miPersonaId;
    if(this.esAdmin){
      this.cobranzaService.GetPagosAll().subscribe({
      next: (res: any) => {
        console.log("Cobros recibidos:", res);
        
        if (res.success) {
          this.cobros = res.data;
        } else if (Array.isArray(res)) {
           this.cobros = res;
        } else {
          this.cobros = []; 
          console.error("Error trayendo cobros:", res.message);
        }

        this.aplicarFiltros();
        if (!this.esAdmin) {
          this.calcularResumen();
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error de red al traer cobros:", err);
        this.isLoading = false;
      }
    });
    }
    else{
      this.userService.GetUsuario(this.email).subscribe({
        next:(res:any)=>{
          this.id=res.persona_id;
          this.cobranzaService.GetPagosUser(this.id).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.cobros = res.data;
            } else if (Array.isArray(res)) {
              this.cobros = res;
            } else {
              this.cobros = []; 
              console.error("Error trayendo cobros:", res.message);
            }

            this.aplicarFiltros();

            if (!this.esAdmin) {
              this.calcularResumen();
            }
            
            this.isLoading = false;
          },
          error: (err) => {
            console.error("Error de red al traer cobros:", err);
            this.isLoading = false;
          }
        });
        }
      })
    }
  }

  // --- LÓGICA PARA EL CARTEL DE RESUMEN ---
  calcularResumen() {
    this.resumenUsuario = { vencidos: 0, pendientes: 0, totalDeuda: 0 };

    this.cobros.forEach(item => {
      const estado = this.getEstadoVisual(item);

      if (estado === 'VENCIDO') {
        this.resumenUsuario.vencidos++;
        this.resumenUsuario.totalDeuda += item.monto;
      } 
      else if (estado === 'PENDIENTE') {
        this.resumenUsuario.pendientes++;
        this.resumenUsuario.totalDeuda += item.monto;
      }
    });
  }

  // --- LÓGICA VISUAL ---
  getEstadoVisual(item: any): string {
    if (item.estado === 'PAGADO') return 'PAGADO';

    const hoy = new Date();
    const diaHoy = hoy.getDate(); 
    
    // Si hoy es día X y vencía antes -> VENCIDO
    if (diaHoy > item.dia_vencimiento) {
      return 'VENCIDO';
    }
    
    return 'PENDIENTE';
  }

  // --- FILTROS ---
  aplicarFiltros() {
    this.cobrosFiltrados = this.cobros.filter(item => {
      
      const estadoReal = this.getEstadoVisual(item);
      const coincideEstado = this.filtroEstado === 'TODOS' || estadoReal === this.filtroEstado;
      
      // Aseguramos comparación flexible (string vs number)
      const coincideActividad = this.filtroActividad === 'TODAS' || item.actividad_id == this.filtroActividad;

      let coincideTexto = true;
      if (this.esAdmin && this.filtroTexto) {
        const termino = this.filtroTexto.toLowerCase();
        // Validamos que item.socio exista antes de hacer toLowerCase
        coincideTexto = item.socio ? item.socio.toLowerCase().includes(termino) : false;
      }

      return coincideEstado && coincideActividad && coincideTexto;
    });
  }

  // --- INTEGRACIÓN CON MERCADO PAGO ---
  iniciarPago(item: any) {
    if(item.estado === 'PAGADO') return;

    const datosPago = {
      // IMPORTANTE: Aquí viaja el ID para que el Worker actualice después
      inscripcion_id: item.inscripcion_id, 
      concepto: `Cuota ${item.periodo} - ${item.nombre}`,
      monto: item.monto,
      moneda: "ARS"
    };

    console.log("Generando preferencia para:", datosPago);

    // this.cobranzaService.GetLinkMP(datosPago).subscribe({
    //   next: (res: any) => {
    //     // Verificamos si la respuesta trae la URL en .data
    //     if (res.success && res.data) {
    //       // REDIRECCIÓN REAL A MP
    //       window.location.href = res.data;
    //     } else {
    //       alert("Error al generar el link de pago: " + (res.message || "Respuesta inválida"));
    //     }
    //   },
    //   error: (err) => {
    //     console.error(err);
    //     alert("Ocurrió un error al conectar con el servicio de pagos.");
    //   }
    // });
  }

  cargarComboActividades() {
    this.actividadesService.GetActividades().subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.actividades = res.data;
        } else if (Array.isArray(res)) {
          this.actividades = res;
        } else {
          this.actividades = [];
        }
      },
      error: (err) => console.error("Error cargando actividades:", err)
    });
  }

  private applyDarkMode(): void {
    // Esta función no necesita modificar el body directamente si el CSS está bien estructurado.
    // La clase [class.dark-mode] en el HTML se encargará de aplicar los estilos.
    // Si necesitas un control global, la lógica del DashboardComponent que modifica
    // document.body es la correcta. Por ahora, lo mantenemos a nivel de componente.
  }

  // Opcional: Si tienes un botón para cambiar el modo oscuro DENTRO de este componente.
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.applyDarkMode();
  }

  descargarComprobante(cobroId: number) {
  this.cobranzaService.DescargarRecibo(cobroId).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Recibo_${cobroId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Error al descargar recibo', err);
      alert('No se pudo generar el recibo. Verifique que el pago esté confirmado.');
    }
    });
  }
}