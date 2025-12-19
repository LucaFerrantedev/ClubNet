import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ReportesService } from '../../services/reportes.service';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-reportes.component',
  imports: [CommonModule, BaseChartDirective, NavbarComponent],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit{
  constructor(private reportesService:ReportesService){}

  public vistaActual: string = 'ingresos'; 

  private colors = {
    primary: '#1e6091',  
    secondary: '#168aad', 
    accent: '#34a0a4',   
    warning: '#ffb703',  
    danger: '#d90429' 
  };

  // 1. Ingresos (Barras)
  public barChartOptions: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  // 2. Deuda (Torta)
  public pieChartOptions: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false };
  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartData<'pie'> = { labels: [], datasets: [] };

  // 3. Ocupación
  public ocupacionChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  // 4. Socios (Línea)
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = { labels: [], datasets: [] };

  ngOnInit(): void {
    this.cargarDatos();
  }

  seleccionarVista(vista: string) {
    this.vistaActual = vista;
  }

  cargarDatos() {
    this.reportesService.GetIngresos().subscribe((res: any) => {
      if (res.success) {
        this.barChartData = {
          labels: res.data.map((x: any) => x.mes),
          datasets: [{ 
            data: res.data.map((x: any) => x.total), 
            label: 'Ingresos Mensuales ($)', 
            backgroundColor: this.colors.primary,
            hoverBackgroundColor: this.colors.secondary
          }]
        };
      }
    });

    this.reportesService.GetDeuda().subscribe((res: any) => {
      if (res.success) {
        this.pieChartData = {
          labels: res.data.map((x: any) => x.estado),
          datasets: [{ 
            data: res.data.map((x: any) => x.montoTotal),
            backgroundColor: [this.colors.primary, this.colors.danger], // Azul vs Rojo
            hoverBackgroundColor: [this.colors.secondary, '#ef233c']
          }]
        };
      }
    });

    this.reportesService.GetEstadoCupos().subscribe((res: any) => {
      if (res.success) {
        this.ocupacionChartData = {
          labels: res.data.map((x: any) => x.actividad),
          datasets: [
            { data: res.data.map((x: any) => x.inscriptos), label: 'Inscriptos', backgroundColor: this.colors.primary },
            { data: res.data.map((x: any) => x.cupo), label: 'Cupo Total', backgroundColor: this.colors.warning }
          ]
        };
      }
    });

    this.reportesService.GetNuevosSocios().subscribe((res: any) => {
      if (res.success) {
        this.lineChartData = {
          labels: res.data.map((x: any) => x.mes),
          datasets: [{ 
            data: res.data.map((x: any) => x.cantidadNuevos), 
            label: 'Nuevos Socios', 
            borderColor: this.colors.accent, 
            backgroundColor: 'rgba(52, 160, 164, 0.2)', 
            pointBackgroundColor: this.colors.primary,
            fill: true,
            tension: 0.4
          }]
        };
      }
    });
  }
}
