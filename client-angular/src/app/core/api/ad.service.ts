import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';

@Injectable({
    providedIn: 'root'
})
export class AdService {

    constructor(private authService: AuthService) { }

    /**
     * Determinar si se deben mostrar los anuncios
     * Los anuncios solo se muestran a usuarios no-premium
     */
    shouldShowAds(): boolean {
        return !this.authService.isPremium();
    }

    /**
     * Obtener mensajes de anuncios simulados
     */
    getAdContent(): { title: string, description: string, ctaText: string } {
        const ads = [
            {
                title: '¡Mejora tu experiencia!',
                description: 'Accede a IntegraTEA Premium y disfruta sin interrupciones',
                ctaText: 'Mejorar Ahora'
            },
            {
                title: 'Más actividades, más aprendizaje',
                description: 'Descubre contenido exclusivo para tus estudiantes',
                ctaText: 'Ver Más'
            },
            {
                title: '¿Cansado de los anuncios?',
                description: 'Hazte Premium y disfruta de una experiencia sin anuncios',
                ctaText: 'Quitar Anuncios'
            }
        ];

        // Seleccionar anuncio aleatorio
        return ads[Math.floor(Math.random() * ads.length)];
    }
}
