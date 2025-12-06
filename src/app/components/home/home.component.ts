import { Component, OnInit } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  DataSource: any;
  constructor(private homeService: HomeService, private router: Router) { }

  ngOnInit(): void {
    this.GetActividades();
  }

  Continuar() {
    this.router.navigate(['/login']);
  }

  GetActividades(){
    this.homeService.GetActividades().subscribe((x: any) => {
      // FILTRO: Solo mostramos las actividades donde estado es true (Activo)
      this.DataSource = x.filter((act: any) => act.estado === true);
      console.log(this.DataSource);
    });
  }
}