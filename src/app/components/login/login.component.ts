import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true
})
export class LoginComponent {

  constructor(private loginService:LoginService, private router: Router){}

  
  password:any;
  confirmarPassword:any;
  datasourceRegister:any;
  datasourceLogin:any;
  mensaje:any;

  ngOnInit(): void {
    
  }

  activeTab: 'login' | 'register' = 'login';

  onLogin() {

    // Ejemplo de lo que iría aca:
    // let obj = {
    //   "nombre": this.nombre,
    //   "password": btoa(this.password)
    // }

    let obj = {

    }

    this.loginService.Login(obj).subscribe({
      next: (x) => {
        this.datasourceLogin = x;

        if (this.datasourceLogin.result == true) {

          // Guardar datos del usuario
          const UserData = {
            password: this.datasourceLogin.password
          };

        }
      }
    })

    alert('¡Login simulado!');



  }

  onRegister() {

    // Ejemplo de lo que iría aca:
    // let obj = {
    //   "nombre": this.nombre,
    //   "password": btoa(this.password)
    // }
    let obj = {

    }

    this.loginService.Register(obj).subscribe({
      next: (response) => {
        if (typeof response === 'boolean') {
          this.datasourceRegister = { result: response, mensaje: '' };
        } else {
          this.datasourceRegister = response;
        }
      }
    });

    alert('¡Registro simulado!');

  }



}