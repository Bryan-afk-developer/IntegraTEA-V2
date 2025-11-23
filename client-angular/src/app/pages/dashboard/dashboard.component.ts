import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { fadeInAnimation } from '../../animations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  animations: [fadeInAnimation]
})
export class DashboardComponent {

  constructor(private router: Router) { }

  navigateToActivities() {
    this.router.navigate(['/activities']);
  }

  navigateToUsers() {
    this.router.navigate(['/users']);
  }

  showNotImplemented() {
    alert('🚧 Esta funcionalidad estará disponible en la versión 3.0 🚧');
  }
}