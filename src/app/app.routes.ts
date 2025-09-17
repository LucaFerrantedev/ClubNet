import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { ContainerComponent } from './components/container/container';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';

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
  }
];