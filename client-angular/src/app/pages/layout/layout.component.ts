import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; // Imports para el routing
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,   // Para <router-outlet>
    RouterLink,     // Para [routerLink]
    RouterLinkActive // Para [routerLinkActive]
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  userName: string | null = 'Educador'; // Valor por defecto

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Obtenemos el nombre del usuario al cargar el layout
    this.userName = this.authService.getUserName();
  }

  handleLogout(): void {
    this.authService.logout();
  }
}