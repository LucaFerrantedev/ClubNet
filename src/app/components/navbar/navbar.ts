import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {

  constructor(
    private loginService: LoginService, private router: Router) {}

  logout() {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

}
