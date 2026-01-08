import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyClientService } from '../../../core/dataservice/company-client/company-client.service';
import { CompanyClient } from '../../../core/dataservice/company-client/company-client.interface';
import { ImageUtilityService } from '../../../core/utility/image-utility.service';
import { PrimeNgModules } from '../../../primeng.modules';

@Component({
	selector: 'app-public-company-client',
	standalone: true,
	imports: [CommonModule,PrimeNgModules],
	templateUrl: './public-company-client.component.html',
	styleUrls: ['./public-company-client.component.scss'],
})
export class PublicCompanyClientComponent implements OnInit {
	clients: CompanyClient[] = [];
	loading = false;
	error: string | null = null;

	constructor(
		private companyClientService: CompanyClientService,
		private imageUtilityService: ImageUtilityService
	) {}

	ngOnInit(): void {
		this.loadClients();
	}

	loadClients(): void {
		this.loading = true;
		this.error = null;

		this.companyClientService.getAllCompanyClients().subscribe({
			next: (data) => {
				// Filter only active clients (no duplication needed - marquee removed)
				this.clients = data.filter((client) => client.isActive);
				this.loading = false;
			},
			error: (error) => {
				console.error('Error loading company clients:', error);
				this.error = 'Failed to load clients. Please try again later.';
				this.loading = false;
				this.clients = [];
			},
		});
	}

	getLogoUrl(logoPath?: string): string {
		if (!logoPath) {
			return '/assets/placeholder-logo.png';
		}
		
		// If it's already a full URL (http/https), return as is
		if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
			return logoPath;
		}
		
		// Use ImageUtilityService to construct the full URL
		return this.imageUtilityService.getImageUrl(logoPath);
	}

	onImageError(event: Event): void {
		const img = event.target as HTMLImageElement;
		if (img) {
			img.src = '/assets/placeholder-logo.png';
		}
	}
}

