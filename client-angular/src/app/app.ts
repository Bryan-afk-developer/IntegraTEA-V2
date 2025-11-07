import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // <-- 1. IMPORTA ESTO

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet // <-- 2. AÑADE ESTO
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  title = 'client-angular';
}