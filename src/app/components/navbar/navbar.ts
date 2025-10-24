import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  standalone: true
})
export class NavbarComponent implements OnInit {

  userRole: number | null = null;
  isLoggedIn$: Observable<boolean>;

  constructor(
    private loginService: LoginService,
    private dashboardService: DashboardService,
    private router: Router
  ) {
    this.isLoggedIn$ = of(this.loginService.isUserAuthenticated());
  }

  ngOnInit(): void {
    if (this.loginService.isUserAuthenticated()) {
      const email = localStorage.getItem('email');
      if (email) {
        this.dashboardService.GetUsuario(email).subscribe((user: any) => {
          this.userRole = user?.rol_id;
        });
      }
    }
  }

  logout() {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

}
