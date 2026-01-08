import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { environment } from '../../../../../environments/environment';
import { Company, CompanyService } from '../../../../core/dataservice';
import { PrimeNgModules } from '../../../../primeng.modules';
import { CompanyProfileModalComponent } from './create-update-company-profile/company-profile-modal.component';


@Component({
	selector: 'app-company-profile',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService, DialogService],
	templateUrl: './company-profile.component.html',
	styleUrls: ['./company-profile.component.scss'],
})
export class CompanyProfileComponent implements OnInit {
	loading: boolean = false;
	company: Company | null = null;
	dialogRef?: DynamicDialogRef;

	constructor(
		private companyService: CompanyService,
		private messageService: MessageService,
		private dialogService: DialogService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadCompany();
	}

	loadCompany() {
		this.loading = true;
		this.companyService.getCompany().subscribe({
			next: (data) => {
				if (data && data.id) {
					this.company = data;
				} else {
					this.company = null;
				}
				this.loading = false;
				this.cdr.markForCheck();
			},
			error: (error) => {
				// If company doesn't exist, set to null
				if (error.status === 404) {
					this.company = null;
				} else {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to load company information',
					});
				}
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	openCompanyProfileModal() {
		this.dialogRef = this.dialogService.open(CompanyProfileModalComponent, {
			header: this.company ? 'Update Company Profile' : 'Create Company Profile',
			width: '90%',
			style: { 'max-width': '1200px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				company: this.company,
			},
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadCompany();
			}
		});
	}

	getLogoUrl(logoPath: string | undefined): string {
		if (!logoPath) {
			return '/assets/images/no-image.png';
		}
		if (logoPath.startsWith('http')) {
			return logoPath;
		}
		return `${environment.BASEAPI_URL}/${logoPath}`;
	}
}

