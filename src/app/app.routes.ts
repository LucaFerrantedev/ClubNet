import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { ContainerComponent } from './components/container/container';
import { LoginComponent } from './components/login/login';

export const routes: Routes = [
  { path: ""},
  {
    path: "login",
    component: ContainerComponent,
    children: [
      { path: "", component: LoginComponent }
    ]
  }
];