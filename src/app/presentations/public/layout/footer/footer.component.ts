import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CompanyService } from '../../../../core/dataservice/company/company.service';
import { Company } from '../../../../core/dataservice/company/company.interface';

@Component({
	selector: 'app-footer',
	templateUrl: './footer.component.html',
	imports: [CommonModule],
})
export class FooterComponent implements OnInit {
	currentYear = new Date().getFullYear();
	company: Company | null = null;
	loading = false;

	socialLinks: Array<{ name: string; icon: string; url: string }> = [];

	constructor(
		private companyService: CompanyService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadCompany();
	}

	loadCompany() {
		this.loading = true;
		this.companyService.getCompany().subscribe({
			next: (data) => {
				this.company = data;
				this.buildSocialLinks();
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: () => {
				// If company doesn't exist, use default values
				this.company = null;
				this.buildSocialLinks();
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	buildSocialLinks() {
		this.socialLinks = [];
		
		if (this.company?.facebookLink) {
			this.socialLinks.push({
				name: 'Facebook',
				icon: 'pi pi-facebook',
				url: this.company.facebookLink,
			});
		}
		
		if (this.company?.tiktokLink) {
			this.socialLinks.push({
				name: 'TikTok',
				icon: 'pi pi-link',
				url: this.company.tiktokLink,
			});
		}

		// If no social links from company, use defaults
		if (this.socialLinks.length === 0) {
			this.socialLinks = [
				{
					name: 'Facebook',
					icon: 'pi pi-facebook',
					url: 'https://facebook.com/idesignbt',
				},
				{
					name: 'Instagram',
					icon: 'pi pi-instagram',
					url: 'https://instagram.com/idesignbt',
				},
			];
		}
	}

	getLogoUrl(): string {
		if (this.company && this.company.logo) {
			// Use the logo endpoint
			return this.companyService.getLogoUrl();
		}
		// Fallback to default logo
		return '/assets/logo.png';
	}

	getCompanyName(): string {
		return this.company?.name || 'iDesign';
	}

	getCompanySlogan(): string {
		return this.company?.slogan || '3D Printing Excellence';
	}

	getCompanyDescription(): string {
		return this.company?.description || 'Specializing in premium 3D printed Bhutanese stupas and custom designs. We bring traditional craftsmanship into the digital age with precision 3D printing technology.';
	}

	getAddress(): string {
		if (this.company?.address) {
			let address = this.company.address;
			if (this.company.dzongkhag) {
				address += `, ${this.company.dzongkhag}`;
			}
			if (this.company.country) {
				address += `, ${this.company.country}`;
			}
			return address;
		}
		return 'Thimphu, Bhutan';
	}

	getPhone(): string {
		return this.company?.phone1 || '+975 17123456';
	}

	getEmail(): string {
		return this.company?.email || 'helloidesign.bt';
	}
}
