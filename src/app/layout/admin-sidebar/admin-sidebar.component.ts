import { Component, ElementRef, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayoutService } from '../service/admin-layout.service';
import { AdminMenuComponent } from '../sidebar-menu/admin-menu/admin-menu.component';
import { DividerModule } from 'primeng/divider';
import { APPNAME, APPSLOGAN } from '../../core/constants/constants';
import { CompanyService } from '../../core/dataservice/company/company.service';
import { Company } from '../../core/dataservice/company/company.interface';

@Component({
	selector: 'app-admin-sidebar',
	templateUrl: './admin-sidebar.component.html',
	styleUrls: ['./admin-sidebar.component.scss'],
	imports: [CommonModule, AdminMenuComponent, DividerModule],
})
export class AdminSidebarComponent implements OnInit {
	appName = APPNAME;
	appSlogan = APPSLOGAN;
	company: Company | null = null;
	logoUrl: string = 'logo.png'; // Fallback logo

	constructor(
		public layoutService: AdminLayoutService,
		public el: ElementRef,
		private companyService: CompanyService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.loadCompanyLogo();
	}

	loadCompanyLogo(): void {
		this.companyService.getCompany().subscribe({
			next: (data) => {
				if (data) {
					this.company = data;
					if (data.logo) {
						// Use the logo endpoint
						this.logoUrl = this.companyService.getLogoUrl();
					} else {
						// Use fallback logo
						this.logoUrl = 'logo.png';
					}
				} else {
					// Use fallback logo
					this.logoUrl = 'logo.png';
				}
				this.cdr.markForCheck();
			},
			error: () => {
				// If company doesn't exist, use fallback logo
				this.logoUrl = 'logo.png';
				this.cdr.markForCheck();
			},
		});
	}

	getCompanyName(): string {
		return this.company?.name || this.appName;
	}

	getCompanySlogan(): string {
		return this.company?.slogan || this.appSlogan;
	}
}
