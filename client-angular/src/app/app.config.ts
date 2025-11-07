import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './core/auth-interceptor'; // <-- 1. IMPORTA EL INTERCEPTOR

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    
    // 2. REGISTRA EL INTERCEPTOR AQUÍ
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};