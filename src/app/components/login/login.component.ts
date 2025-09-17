import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true
})
export class LoginComponent {
  activeTab: 'login' | 'register' = 'login';

  onLogin(event: Event) {
    event.preventDefault();
    alert('¡Login simulado!');
  }

  onRegister(event: Event) {
    event.preventDefault();
    alert('¡Registro simulado!');
  }
}