import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  logout() {
    localStorage.removeItem('recordarDatos');
    localStorage.removeItem('email');
    localStorage.removeItem('clave');
    localStorage.removeItem('rol');
    window.location.href = '/login';
  }

}
