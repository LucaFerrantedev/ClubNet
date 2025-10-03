import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { ContainerComponent } from './components/container/container';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ActividadesComponent } from './components/actividades/actividades.component';

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
    canActivate: [AuthGuard],
    children: [
      { path: "", component: DashboardComponent }
    ]
  },
  {
    path: "actividades",
    component: ContainerComponent,
    //canActivate: [AuthGuard],
    children: [
      { path: "", component: ActividadesComponent }
    ]
  }
];