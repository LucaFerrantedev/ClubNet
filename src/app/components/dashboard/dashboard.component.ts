import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar";

@Component({
  selector: 'app-dashboard',
  imports: [NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true
})
export class DashboardComponent implements OnInit {
  email = '';
  nombre = '';
  apellido = '';
  dni = '';

  ngOnInit(): void {
    this.email = localStorage.getItem('email') || '';
    this.nombre = localStorage.getItem('nombre') || '';
    this.apellido = localStorage.getItem('apellido') || '';
    this.dni = localStorage.getItem('dni') || '';
  }
}
