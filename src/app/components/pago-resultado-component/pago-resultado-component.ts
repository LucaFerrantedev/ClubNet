import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router,ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pago-resultado-component',
  imports: [CommonModule,RouterModule],
  templateUrl: './pago-resultado-component.html',
  styleUrl: './pago-resultado-component.css'
})
export class PagoResultadoComponent {
estado: string = ''; 
  paymentId: string = '';
  externalReference: string = ''; 

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.estado = data['estado'];
    });

    this.route.queryParams.subscribe(params => {
      this.paymentId = params['payment_id'] || params['collection_id'] || 'No disponible';
      this.externalReference = params['external_reference'] || 'No disponible';
      
      console.log('Datos recibidos de MP:', params);
    });
  }

  volverAlInicio() {
    this.router.navigate(['/home']); // O a donde quieras redirigir
  }
}
