import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar";
import { Router } from '@angular/router';
import { ActividadesService } from '../../services/actividades.service';

@Component({
  selector: 'app-actividades',
  imports: [NavbarComponent],
  templateUrl: './actividades.component.html',
  styleUrl: './actividades.component.css'
})
export class ActividadesComponent {
  constructor(private service: ActividadesService, private router: Router) { }

  
}
