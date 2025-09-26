import { Component } from '@angular/core';
import { DashboardService } from '../../services/dashboard';
import { Router } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar";

@Component({
  selector: 'app-dashboard',
  imports: [NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  constructor(private dashboardService:DashboardService, private router: Router) { }


}
