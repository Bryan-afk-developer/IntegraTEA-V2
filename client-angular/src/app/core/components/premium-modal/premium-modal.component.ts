import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../api/payment.service';
import { AuthService } from '../../auth.service';

@Component({
    selector: 'app-premium-modal',
    imports: [CommonModule],
    templateUrl: './premium-modal.component.html',
    styleUrls: ['./premium-modal.component.scss']
})
export class PremiumModalComponent implements OnInit {
    isOpen = false;
    isLoading = false;
    errorMessage: string | null = null;

    features = [
        { icon: '🚫', text: 'Sin anuncios ni interrupciones' },
        { icon: '⚡', text: 'Experiencia más rápida' },
        { icon: '🎨', text: 'Interfaz limpia y profesional' },
        { icon: '❤️', text: 'Apoya el desarrollo de IntegraTEA' }
    ];

    constructor(
        private paymentService: PaymentService,
        private authService: AuthService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        // Verificar si regresamos de un pago exitoso
        this.route.queryParams.subscribe(params => {
            const sessionId = params['session_id'];
            const paymentStatus = params['payment'];

            if (paymentStatus === 'success' && sessionId) {
                this.checkPaymentStatus(sessionId);
            }
        });
    }

    open(): void {
        this.isOpen = true;
        this.errorMessage = null;
    }

    close(): void {
        this.isOpen = false;
        this.errorMessage = null;
    }

    async handleUpgrade(): Promise<void> {
        this.isLoading = true;
        this.errorMessage = null;

        try {
            // Crear sesión de checkout
            const response = await this.paymentService.createCheckoutSession().toPromise();

            if (response && response.url) {
                // Redirigir a Stripe Checkout directamente usando la URL
                window.location.href = response.url;
            } else if (response && response.sessionId) {
                // Alternativa: usar el sessionId para redirigir con Stripe.js
                await this.paymentService.redirectToCheckout(response.sessionId);
            } else {
                this.errorMessage = 'Error al crear la sesión de pago. Inténtalo de nuevo.';
                this.isLoading = false;
            }
        } catch (error: any) {
            console.error('Error creating checkout session:', error);

            // Mostrar mensaje de error más específico si está disponible
            if (error?.error?.message) {
                this.errorMessage = error.error.message;
            } else {
                this.errorMessage = 'Ocurrió un error al procesar tu solicitud. Por favor, inténtalo más tarde.';
            }

            this.isLoading = false;
        }
    }

    /**
     * Verificar estado de pago al regresar de Stripe
     */
    async checkPaymentStatus(sessionId: string): Promise<void> {
        try {
            const response = await this.paymentService.verifyPayment(sessionId).toPromise();

            if (response.success && response.isPremium) {
                // Actualizar el estado premium en AuthService
                this.authService.updatePremiumStatus(true);
                console.log('Premium status updated successfully - Ads should now be hidden');

                // Recargar la página para reflejar cambios
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
        }
    }
}
