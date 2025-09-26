import { Component } from '@angular/core';

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
    window.location.href = '/login';
  }

}
