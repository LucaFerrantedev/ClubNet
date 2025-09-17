import { Component } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  constructor(private homeService:HomeService, private router: Router) { }

  Continuar() {
    this.router.navigate(['/login']);
  }
}
