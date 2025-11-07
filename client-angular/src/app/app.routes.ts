import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard'; // Importamos nuestro guardia

// Importamos los componentes que creamos
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { ActivityManagementComponent } from './pages/activity-management/activity-management'; // <-- AHORA SÍ EXISTE

export const routes: Routes = [
  // 1. Ruta de Login (pública)
  { path: 'login', component: LoginComponent },

  // 2. Rutas de Admin (privadas, dentro del Layout)
  { 
    path: '', // La raíz del sitio (ej. localhost:4200/)
    component: LayoutComponent,
    canActivate: [authGuard], // <-- Seguridad: Protege todas las rutas hijas
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'activities', component: ActivityManagementComponent }, // <-- AHORA SÍ FUNCIONA
      
      // Si entran a la raíz (ej. /), redirige al dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' } 
    ]
  },

  // 3. Redirección general
  // Si escriben cualquier otra cosa (ej. /pagina-loca), redirige al login
  { path: '**', redirectTo: 'login' } 
];