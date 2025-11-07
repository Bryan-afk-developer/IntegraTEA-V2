import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // La API de tu backend (Asegúrate que tu backend esté corriendo en localhost:5001 o en Render)
  // Usamos /api para que funcione con el proxy (ver paso 4)
  private apiUrl = '/api/auth'; 

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  // Método para iniciar sesión
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        // Si el login es exitoso, guardamos los datos como antes
        localStorage.setItem('jwtToken', response.token);
        localStorage.setItem('userName', response.educator.firstName);
      })
    );
  }

  // Método para cerrar sesión
  logout(): void {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userName');
    // Redirigimos al login
    this.router.navigate(['/login']); 
  }

  // Helper para el AuthGuard
  isAuthenticated(): boolean {
    return !!localStorage.getItem('jwtToken');
  }

  // Helper para el Layout
  getUserName(): string | null {
    return localStorage.getItem('userName');
  }
}