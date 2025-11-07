import { Component } from '@angular/core';
import { fadeInAnimation } from '../../animations'; // Importamos la animación

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  animations: [ fadeInAnimation ] // Usamos la animación
})
export class DashboardComponent {

}