import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private apiUrl = '/api/payments';
    private cachedPublishableKey: string | null = null;

    constructor(private http: HttpClient) { }

    /**
     * Crear sesión de checkout en Stripe
     */
    createCheckoutSession(): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/create-checkout`, {});
    }

    /**
     * Verificar el estado del pago
     */
    verifyPayment(sessionId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/verify/${sessionId}`);
    }

    /**
     * Obtener el estado premium del usuario
     */
    getPremiumStatus(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/premium-status`);
    }

    /**
     * Obtener la clave pública de Stripe desde el servidor
     */
    async getPublishableKey(): Promise<string> {
        if (this.cachedPublishableKey) {
            return this.cachedPublishableKey;
        }

        try {
            const response = await firstValueFrom(
                this.http.get<{ publishableKey: string }>(`${this.apiUrl}/publishable-key`)
            );
            this.cachedPublishableKey = response.publishableKey;
            return response.publishableKey;
        } catch (error) {
            console.error('Error fetching publishable key:', error);
            throw new Error('No se pudo obtener la clave de Stripe');
        }
    }

    /**
     * Redirigir al usuario a Stripe Checkout
     */
    async redirectToCheckout(sessionId: string): Promise<void> {
        const publishableKey = await this.getPublishableKey();
        const stripe = (window as any).Stripe(publishableKey);
        await stripe.redirectToCheckout({ sessionId: sessionId });
    }

    /**
     * Cancelar suscripción premium
     */
    cancelSubscription(): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/cancel-subscription`, {});
    }
}

