import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { environment } from '../../../../../../environments/environment';
import { CreateCompanyDto, ZpssBankName, CompanyService, UpdateCompanyDto } from '../../../../../core/dataservice';
import { PrimeNgModules } from '../../../../../primeng.modules';


@Component({
	selector: 'app-company-profile-modal',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './company-profile-modal.component.html',
	styleUrls: ['./company-profile-modal.component.scss'],
})
export class CompanyProfileModalComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	isEditMode: boolean = false;

	// Form Data
	company: Partial<CreateCompanyDto> = {
		name: '',
		phone1: '',
		phone2: '',
		phone3: '',
		email: '',
		address: '',
		dzongkhag: '',
		thromde: '',
		country: 'Bhutan',
		website: '',
		tpnNumber: '',
		businessLicenseNumber: '',
		slogan: '',
		facebookLink: '',
		tiktokLink: '',
		description: '',
		logo: '',
		isActive: true,
		zpssBankName: undefined,
		zpssAccountName: '',
		zpssAccountNumber: '',
	};

	// Dzongkhag options (Bhutan districts)
	dzongkhagOptions = [
		'Bumthang',
		'Chhukha',
		'Dagana',
		'Gasa',
		'Haa',
		'Lhuntse',
		'Mongar',
		'Paro',
		'Pemagatshel',
		'Punakha',
		'Samdrup Jongkhar',
		'Samtse',
		'Sarpang',
		'Thimphu',
		'Trashigang',
		'Trashiyangtse',
		'Trongsa',
		'Tsirang',
		'Wangdue Phodrang',
		'Zhemgang',
	];

	// Bank name options
	bankNameOptions = [
		{ label: 'BOB', value: ZpssBankName.BOB },
		{ label: 'BNB', value: ZpssBankName.BNB },
		{ label: 'PNB', value: ZpssBankName.PNB },
		{ label: 'BDBL', value: ZpssBankName.BDBL },
		{ label: 'TBANK', value: ZpssBankName.TBANK },
		{ label: 'DKBANK', value: ZpssBankName.DKBANK },
	];

	constructor(
		private companyService: CompanyService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		public ref: DynamicDialogRef,
		public config: DynamicDialogConfig
	) {}

	ngOnInit() {
		if (this.config.data?.company) {
			this.isEditMode = true;
			const companyData = this.config.data.company;
			this.company = {
				name: companyData.name || '',
				phone1: companyData.phone1 || '',
				phone2: companyData.phone2 || '',
				phone3: companyData.phone3 || '',
				email: companyData.email || '',
				address: companyData.address || '',
				dzongkhag: companyData.dzongkhag || '',
				thromde: companyData.thromde || '',
				country: companyData.country || 'Bhutan',
				website: companyData.website || '',
				tpnNumber: companyData.tpnNumber || '',
				businessLicenseNumber: companyData.businessLicenseNumber || '',
				slogan: companyData.slogan || '',
				facebookLink: companyData.facebookLink || '',
				tiktokLink: companyData.tiktokLink || '',
				description: companyData.description || '',
				logo: companyData.logo || '',
				isActive: companyData.isActive !== undefined ? companyData.isActive : true,
				zpssBankName: companyData.zpssBankName,
				zpssAccountName: companyData.zpssAccountName || '',
				zpssAccountNumber: companyData.zpssAccountNumber || '',
			};
		}
	}

	saveCompany() {
		this.submitted = true;

		if (!this.isFormValid()) {
			return;
		}

		this.loading = true;

		if (this.isEditMode) {
			const updateData: UpdateCompanyDto = { ...this.company };
			this.companyService.updateCompany(updateData).subscribe({
				next: (data) => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Company profile updated successfully',
					});
					this.ref.close(data);
				},
				error: () => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to update company profile',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		} else {
			const createData: CreateCompanyDto = this.company as CreateCompanyDto;
			this.companyService.createCompany(createData).subscribe({
				next: (data) => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Company profile created successfully',
					});
					this.ref.close(data);
				},
				error: () => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to create company profile',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		}
	}

	isFormValid(): boolean {
		const hasName = !!(this.company.name && this.company.name.trim().length > 0);
		const hasBankName = !!this.company.zpssBankName;
		const hasAccountName = !!(this.company.zpssAccountName && this.company.zpssAccountName.trim().length > 0);
		const hasAccountNumber = !!(this.company.zpssAccountNumber && this.company.zpssAccountNumber.trim().length > 0);
		return hasName && hasBankName && hasAccountName && hasAccountNumber;
	}

	close() {
		this.ref.close();
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

	isValidEmail(email: string | undefined): boolean {
		if (!email) return true; // Optional field
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}
}

