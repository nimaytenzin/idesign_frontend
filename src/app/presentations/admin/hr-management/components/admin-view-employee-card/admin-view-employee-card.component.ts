import { Component, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { PrimeNgModules } from '../../../../../primeng.modules';
import { User } from '../../../../../core/dataservice/user/user.interface';
import { EmployeeStatus } from '../../../../../core/constants/enums';
import { environment } from '../../../../../../environments/environment';

@Component({
	selector: 'app-admin-view-employee-card',
	standalone: true,
	imports: [CommonModule, PrimeNgModules],
	templateUrl: './admin-view-employee-card.component.html',
	styleUrls: ['./admin-view-employee-card.component.scss'],
})
export class AdminViewEmployeeCardComponent implements OnInit {
	staff: User | null = null;

	constructor(
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {}

	ngOnInit() {
		if (this.config?.data) {
			this.staff = this.config.data.staff;
		}
	}

	formatDate(date: Date | string | undefined): string {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	parseImageUrl(profileImageUrl: string | undefined): string {
		if (!profileImageUrl) return '/assets/images/no-image.png';
		return `${environment.BASEAPI_URL}${profileImageUrl}`;
	}

	getStatusLabel(status: EmployeeStatus | undefined): string {
		if (!status) return 'N/A';
		return status.charAt(0) + status.slice(1).toLowerCase();
	}

	getStatusSeverity(status: EmployeeStatus | undefined): string {
		switch (status) {
			case EmployeeStatus.ACTIVE:
				return 'success';
			case EmployeeStatus.INACTIVE:
				return 'warning';
			case EmployeeStatus.TERMINATED:
				return 'danger';
			default:
				return 'secondary';
		}
	}

	close() {
		if (this.ref) {
			this.ref.close();
		}
	}
}
