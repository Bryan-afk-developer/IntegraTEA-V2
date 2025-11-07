import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { fadeInAnimation } from '../../animations'; // Importamos la animación

// Imports necesarios para los formularios de Angular
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, // Necesario para directivas como @if
    FormsModule   // Necesario para [(ngModel)]
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [ fadeInAnimation ] // Usamos la animación
})
export class LoginComponent {
  // Variables para enlazar con el HTML
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  handleLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, ingresa email y contraseña.';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Si el login es exitoso, el servicio guarda el token
        // y nosotros redirigimos al dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        // Mostramos el mensaje de error de la API
        this.errorMessage = err.error?.message || 'Error de conexión. Inténtalo de nuevo.';
        console.error('Error en el login:', err);
      }
    });
  }
}