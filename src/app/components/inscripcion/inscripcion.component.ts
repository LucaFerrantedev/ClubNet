import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-inscripcion',
  imports: [CommonModule],
  templateUrl: './inscripcion.component.html',
  styleUrl: './inscripcion.component.css',
  standalone: true
})
export class InscripcionComponent implements OnInit{

  actividadId:number | null=null

  constructor(){
    this.actividadId = history.state?.actividadId;
  }

  ngOnInit(): void {
    if (this.actividadId) {
      console.log('ID de la actividad recibida por state:', this.actividadId);
    } 
  }
}
