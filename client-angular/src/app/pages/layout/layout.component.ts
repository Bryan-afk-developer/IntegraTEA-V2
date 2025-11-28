import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { PaymentService } from '../../core/api/payment.service';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; // Imports para el routing
import { CommonModule } from '@angular/common';
import { PremiumModalComponent } from '../../core/components/premium-modal/premium-modal.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,   // Para <router-outlet>
    RouterLink,     // Para [routerLink]
    RouterLinkActive, // Para [routerLinkActive]
    PremiumModalComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  userName: string | null = 'Educador'; // Valor por defecto
  @ViewChild(PremiumModalComponent) premiumModal!: PremiumModalComponent;

  constructor(
    public authService: AuthService,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    // Obtenemos el nombre del usuario al cargar el layout
    this.userName = this.authService.getUserName();
  }

  handleLogout(): void {
    this.authService.logout();
  }

  openPremiumModal(): void {
    this.premiumModal.open();
  }

  async openManagePremiumModal(): Promise<void> {
    const action = confirm(
      '¡Eres usuario Premium! ✨\n\n' +
      'Beneficios activos:\n' +
      '✅ Sin anuncios\n' +
      '✅ Experiencia premium\n\n' +
      '¿Deseas cancelar tu suscripción Premium?\n' +
      '(Los anuncios volverán a aparecer)'
    );

    if (action) {
      try {
        const response = await this.paymentService.cancelSubscription().toPromise();

        if (response.success) {
          this.authService.updatePremiumStatus(false);
          alert('✅ Suscripción cancelada exitosamente. Los anuncios ahora aparecerán.');
          window.location.reload();
        }
      } catch (error) {
        console.error('Error canceling subscription:', error);
        alert('❌ Error al cancelar la suscripción. Por favor, intenta de nuevo.');
      }
    }
  }

  get isPremium(): boolean {
    return this.authService.isPremium();
  }
}