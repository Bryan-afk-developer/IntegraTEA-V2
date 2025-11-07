import { trigger, transition, style, animate } from '@angular/animations';

// Animación reutilizable para que las páginas aparezcan suavemente
export const fadeInAnimation = trigger('fadeIn', [
  transition(':enter', [
    // Estado inicial (completamente transparente)
    style({ opacity: 0 }),
    
    // Animación hacia el estado final (completamente visible)
    animate('300ms ease-out', style({ opacity: 1 }))
  ])
]);