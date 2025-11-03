import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { InscripcionService } from '../../services/inscripcion.service';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-inscripcion',
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './inscripcion.component.html',
  styleUrl: './inscripcion.component.css',
  standalone: true
})
export class InscripcionComponent implements OnInit{

  actividadId:number | null=null;
  DataActividad:any;
  nombre:string='';
  apellido:string='';
  fechaNacimiento:string='';
  sexo:any;
  dni:string='';
  DataRegistro:any;
  DataMercadoPago:any;

  constructor(private inscripcionSvc:InscripcionService){
    this.actividadId = history.state?.actividadId;
  }

  ngOnInit(): void {
    if (this.actividadId) {
      this.GetActividad(this.actividadId);
    } 
  }

  GetActividad(id:any){
    this.inscripcionSvc.GetActividadById(id).subscribe(x=>{
      this.DataActividad=x;
      console.log(x);
    })
  }

  ConfirmarInscripcion(){
    let obj={
      dni:Number(this.dni),
      actividad_id:this.actividadId
    }
    this.inscripcionSvc.RegisterToActivity(obj).subscribe(x=>{
      this.DataRegistro=x;
      if(this.DataRegistro.success==true){
        this.GenerarLinkMP();
      }
    })
  }

  GenerarLinkMP(){
    let obj={
      inscripcion_id: Number(this.DataRegistro.data),
      concepto: "Inscripcion - "+this.DataActividad.nombre,
      monto: Number(this.DataActividad.cuota_valor),
      moneda: "ARS"
    }
    this.inscripcionSvc.GetLinkMP(obj).subscribe(x=>{
      this.DataMercadoPago=x;
      if (this.DataMercadoPago.success) {
      window.location.href = this.DataMercadoPago.data; 
    }
    })
  }
}
