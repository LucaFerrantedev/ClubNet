import { Routes } from '@angular/router';
import { ContainerComponent } from './components/container/container.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ActividadesComponent } from './components/actividades/actividades.component';
import { authGuard } from './guards/auth.guard';
import { ClasesComponent } from './components/clases/clases.component';

export const routes: Routes = [
  { path: "", redirectTo: "/home", pathMatch: "full" },
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
      { path: "", component: ClasesComponent}
    ]
  }
];