import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
	selector: 'app-footer',
	templateUrl: './footer.component.html',
	imports: [CommonModule],
})
export class FooterComponent {
	currentYear = new Date().getFullYear();

	socialLinks = [
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
		{
			name: 'WhatsApp',
			icon: 'pi pi-whatsapp',
			url: 'https://wa.me/97517123456',
		},
		{
			name: 'LinkedIn',
			icon: 'pi pi-linkedin',
			url: 'https://linkedin.com/company/idesignbt',
		},
	];
}
