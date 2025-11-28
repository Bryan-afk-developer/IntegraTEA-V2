import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { fadeInAnimation } from '../../animations';
import { AdBannerComponent } from '../../core/components/ad-banner/ad-banner.component';
import { AuthService } from '../../core/auth.service';
import { PaymentService } from '../../core/api/payment.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AdBannerComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  animations: [fadeInAnimation]
})
export class DashboardComponent {

  constructor(
    private router: Router,
    private authService: AuthService,
    private paymentService: PaymentService
  ) { }

  navigateToActivities() {
    this.router.navigate(['/activities']);
  }

  navigateToUsers() {
    this.router.navigate(['/users']);
  }

  showNotImplemented() {
    alert('🚧 Esta funcionalidad estará disponible en la versión 3.0 🚧');
  }

  isPremium(): boolean {
    return this.authService.isPremium();
  }

  async cancelSubscription() {
    const confirm = window.confirm('¿Estás seguro de que deseas cancelar tu suscripción Premium? Los anuncios volverán a aparecer.');

    if (confirm) {
      try {
        const response = await this.paymentService.cancelSubscription().toPromise();

        if (response.success) {
          // Actualizar estado en AuthService
          this.authService.updatePremiumStatus(false);

          alert('✅ Suscripción cancelada exitosamente. Los anuncios ahora aparecerán.');

          // Recargar página para mostrar anuncios
          window.location.reload();
        }
      } catch (error) {
        console.error('Error canceling subscription:', error);
        alert('❌ Error al cancelar la suscripción. Por favor, intenta de nuevo.');
      }
    }
  }
}