import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdService } from '../../api/ad.service';

@Component({
    selector: 'app-ad-banner',
    imports: [CommonModule],
    templateUrl: './ad-banner.component.html',
    styleUrls: ['./ad-banner.component.scss']
})
export class AdBannerComponent {
    @Input() size: 'horizontal' | 'vertical' | 'square' = 'horizontal';

    adContent: { title: string, description: string, ctaText: string };

    constructor(public adService: AdService) {
        this.adContent = this.adService.getAdContent();
    }

    get shouldShow(): boolean {
        return this.adService.shouldShowAds();
    }
}
