import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeProfileService } from '../../../core/dataservice/hr-management/employee-profile/employee-profile.service';
 import { MessageService } from 'primeng/api';
import { PrimeNgModules } from '../../../primeng.modules';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/dataservice/user/user.interface';

@Component({
	selector: 'app-public-about',
	standalone: true,
	imports: [CommonModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './public-about.component.html',
	styleUrls: ['./public-about.component.scss'],
})
export class PublicAboutComponent implements OnInit {
	staffList: User[] = [];
	loading: boolean = false;
	failedImages: Set<number> = new Set();

	constructor(
		private employeeProfileService: EmployeeProfileService,
		private messageService: MessageService
	) {}

	ngOnInit() {
		this.loadStaff();
	}

	loadStaff() {
		this.loading = true;
		this.employeeProfileService.getPublicStaffList().subscribe({
			next: (staff) => {
				this.staffList = staff;
				this.loading = false;
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load staff information',
				});
				this.loading = false;
			},
		});
	}

	getProfileImageUrl(staff: User): string | null {
		
		
		return `${environment.BASEAPI_URL}${staff.profileImageUrl}`;
	}

	onImageError(index: number) {
		this.failedImages.add(index);
	}

	hasImageFailed(index: number): boolean {
		return this.failedImages.has(index);
	}
}
