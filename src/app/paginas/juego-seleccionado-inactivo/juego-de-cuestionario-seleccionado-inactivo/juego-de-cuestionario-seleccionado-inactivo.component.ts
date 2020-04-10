import { Component, OnInit } from '@angular/core';
import { Juego, Alumno } from 'src/app/clases';
import { AlumnoJuegoDeCuestionario } from 'src/app/clases/AlumnoJuegoDeCuestionario';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { SesionService, PeticionesAPIService, CalculosService } from 'src/app/servicios';
import { Location } from '@angular/common';
import { JuegoDeCuestionario } from 'src/app/clases/JuegoDeCuestionario';
import Swal from 'sweetalert2';
import { DialogoConfirmacionComponent } from '../../COMPARTIDO/dialogo-confirmacion/dialogo-confirmacion.component';
import { TablaAlumnoJuegoDeCuestionario } from 'src/app/clases/TablaAlumnoJuegoDeCuestionario';

@Component({
  selector: 'app-juego-de-cuestionario-seleccionado-inactivo',
  templateUrl: './juego-de-cuestionario-seleccionado-inactivo.component.html',
  styleUrls: ['./juego-de-cuestionario-seleccionado-inactivo.component.scss']
})
export class JuegoDeCuestionarioSeleccionadoInactivoComponent implements OnInit {

  //Juego de Cuestionario saleccionado
  juegoSeleccionado: Juego

  //Recuperamos la informacion del juego
  alumnosDelJuego: Alumno[];
  
  //Lista de los alumnos ordenada segun su nota
  listaAlumnosOrdenadaPorNota: AlumnoJuegoDeCuestionario[];
  rankingAlumnosPorNota: TablaAlumnoJuegoDeCuestionario[];

  mensaje: 'Estas segura/o que quieres reactivar: ';

  mensajeFinalizar: 'Estas segura/o de que quieres finalizar: '

  //Orden conlumnas de la tabla
  displayedColumnsAlumnos: string[] = ['nombreAlumno', 'primerApellido', 'segundoApellido', 'nota'];

  dataSourceAlumno;

  constructor(  public dialog: MatDialog,
                public sesion: SesionService,
                public peticionesAPI: PeticionesAPIService,
                public calculos: CalculosService,
                private location: Location) { }

  ngOnInit() {
    this.juegoSeleccionado = this.sesion.DameJuego();
    this.AlumnosDelJuego();
  }

  AlumnosDelJuego(){
    this.peticionesAPI.DameAlumnosJuegoDeCuestionario(this.juegoSeleccionado.id)
    .subscribe(alumnosJuego => {
      this.alumnosDelJuego = alumnosJuego;
      this.RecuperarInscripcionesAlumnoJuego();
    });
  }

  RecuperarInscripcionesAlumnoJuego(){
    this.peticionesAPI.DameInscripcionesAlumnoJuegoDeCuestionario(this.juegoSeleccionado.id)
    .subscribe(inscripciones => {
      this.listaAlumnosOrdenadaPorNota = inscripciones;
      this.listaAlumnosOrdenadaPorNota = this.listaAlumnosOrdenadaPorNota.sort(function(a, b){
        return b.Nota - a.Nota;
      });
      this.TablaClasificacionTotal();
    });
  }

  TablaClasificacionTotal(){
    this.rankingAlumnosPorNota = this.calculos.PrepararTablaRankingCuestionario(this.listaAlumnosOrdenadaPorNota,
      this.alumnosDelJuego);
    
    this.dataSourceAlumno = new MatTableDataSource(this.rankingAlumnosPorNota)
  }

  ReactivarJuego(){
    this.peticionesAPI.CambiaEstadoJuegoDeCuestionario(new JuegoDeCuestionario(this.juegoSeleccionado.NombreJuego, this.juegoSeleccionado.PuntuacionCorrecta,
      this.juegoSeleccionado.PuntuacionIncorrecta, this.juegoSeleccionado.Presentacion, true, this.juegoSeleccionado.JuegoTerminado,
      this.juegoSeleccionado.profesorId, this.juegoSeleccionado.grupoId, this.juegoSeleccionado.cuestionarioId), this.juegoSeleccionado.id, this.juegoSeleccionado.grupoId)
      .subscribe(res => {
        this.location.back();
      })
  }

  AbrirDialogoConfirmacionReactivar(): void {

    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      height: '150px',
      data: {
        mensaje: this.mensaje,
        nombre: this.juegoSeleccionado.Tipo,
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.ReactivarJuego();
        Swal.fire('Reactivado', this.juegoSeleccionado.Tipo + ' reactivado correctamente', 'success');
      }
    });
  }

  applyFilter(filterValue: string){
    this.dataSourceAlumno.filter = filterValue.trim().toLowerCase();
  }

}