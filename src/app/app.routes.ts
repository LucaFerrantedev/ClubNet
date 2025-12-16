import { Routes } from '@angular/router';
import { ContainerComponent } from './components/container/container.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ActividadesComponent } from './components/actividades/actividades.component';
import { authGuard } from './guards/auth.guard';
import { ClasesComponent } from './components/clases/clases.component';
import { InscripcionComponent } from './components/inscripcion/inscripcion.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { PagoResultadoComponent } from './components/pago-resultado-component/pago-resultado-component';
import { InscripcionesComponent } from './components/inscripciones/inscripciones.component';
import { CobranzaComponent } from './components/cobranza/cobranza.component';
import { ReportesComponent } from './components/reportes/reportes.component';

export const routes: Routes = [
  // Redirección de la ruta raíz ("") a "/home"
  //{ path: "", redirectTo: "/home", pathMatch: "full" },

  {
    path: "",
    component: ContainerComponent,
    children: [
      { path: "", component: HomeComponent }
    ]
  },

  {
    path: "home",
    component: ContainerComponent,
    children: [
      { path: "", component: HomeComponent }
    ]
  },
  {
    path: "login",
    component: ContainerComponent,
    children: [
      { path: "", component: LoginComponent }
    ]
  },
  { 
    path: 'pago/exito', 
    component: PagoResultadoComponent,
    data: { estado: 'exito' } 
  },
  { 
    path: 'pago/fallo', 
    component: PagoResultadoComponent, 
    data: { estado: 'fallo' }
  },
  { 
    path: 'pago/pendiente', 
    component: PagoResultadoComponent, 
    data: { estado: 'pendiente' } 
  },
  {
    path: "dashboard",
    component: ContainerComponent,
    canActivate: [authGuard],
    children: [
      { path: "", component: DashboardComponent }
    ]
  },
  {
    path: "actividades",
    component: ContainerComponent,
    canActivate: [authGuard],
    children: [
      { path: "", component: ActividadesComponent }
    ]
  },
  {
    path: "clases",
    component: ContainerComponent,
    canActivate: [authGuard],
    children: [
      { path: "", component: ClasesComponent }
    ]
  },
  {
    path: "inscripcion",
    component: ContainerComponent,
    canActivate: [authGuard],
    children: [
      { path: "", component: InscripcionComponent }
    ]
  },
  {
    path: "usuarios",
    component: ContainerComponent,
    canActivate: [authGuard],
    children: [
      { path: "", component: UsuariosComponent }
    ]
  },
  {
    path: "inscripciones-detalle",
    component: ContainerComponent,
    canActivate: [authGuard],
    children: [
      { path: "", component: InscripcionesComponent }
    ]
  },
  {
    path: "pagos",
    component: ContainerComponent,
    canActivate: [authGuard],
    children: [
      { path: "", component: CobranzaComponent }
    ]
  },
  {
    path: "reportes",
    component: ContainerComponent,
    canActivate: [authGuard],
    children: [
      { path: "", component: ReportesComponent }
    ]
  },
  // Captura cualquier URL no definida y redirige a /home
  { path: '**', redirectTo: '/home' }
];