import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EmployeePayscaleService } from '../../../../../core/dataservice/hr-management/employee-profile/employee-payscale.service';
import {
	UpdateEmployeePayscaleDto,
	EmployeePayscale,
} from '../../../../../core/dataservice/hr-management/employee-profile/employee-payscale.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-update-employee-payscale',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './update-employee-payscale.component.html',
	styleUrls: ['./update-employee-payscale.component.scss'],
})
export class UpdateEmployeePayscaleComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	payscale: EmployeePayscale | null = null;
	userId: number = 0;

	updateData: UpdateEmployeePayscaleDto = {};

	constructor(
		private payscaleService: EmployeePayscaleService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {}

	ngOnInit() {
		if (this.config?.data) {
			this.payscale = this.config.data.payscale;
			this.userId = this.config.data.userId;
			if (this.payscale) {
				this.updateData = {
					basicSalary: this.payscale.basicSalary,
					benefitsAllowance: this.payscale.benefitsAllowance,
					salaryArrear: this.payscale.salaryArrear,
					grossSalary: this.payscale.grossSalary,
					pfDeduction: this.payscale.pfDeduction,
					gisDeduction: this.payscale.gisDeduction,
					netSalary: this.payscale.netSalary,
					tds: this.payscale.tds,
					healthContribution: this.payscale.healthContribution,
					totalPayout: this.payscale.totalPayout,
				};
			}
		}
	}

	calculateGrossSalary() {
		if (this.updateData.basicSalary !== undefined && this.updateData.benefitsAllowance !== undefined) {
			this.updateData.grossSalary = this.updateData.basicSalary + this.updateData.benefitsAllowance + (this.updateData.salaryArrear || 0);
			this.calculateNetSalary();
		}
	}

	calculateNetSalary() {
		if (this.updateData.grossSalary !== undefined && this.updateData.pfDeduction !== undefined && this.updateData.gisDeduction !== undefined) {
			this.updateData.netSalary = this.updateData.grossSalary - this.updateData.pfDeduction - this.updateData.gisDeduction;
			this.calculateTotalPayout();
		}
	}

	calculateTotalPayout() {
		if (this.updateData.netSalary !== undefined && this.updateData.tds !== undefined && this.updateData.healthContribution !== undefined) {
			this.updateData.totalPayout = this.updateData.netSalary - this.updateData.tds - this.updateData.healthContribution;
		}
	}

	savePayscale() {
		this.submitted = true;

		if (!this.payscale || !this.userId) {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Payscale data not found',
			});
			return;
		}

		this.loading = true;

		// Round all values to 2 decimal places
		const dto: UpdateEmployeePayscaleDto = {};
		if (this.updateData.basicSalary !== undefined) dto.basicSalary = Number(this.updateData.basicSalary.toFixed(2));
		if (this.updateData.benefitsAllowance !== undefined) dto.benefitsAllowance = Number(this.updateData.benefitsAllowance.toFixed(2));
		if (this.updateData.salaryArrear !== undefined) dto.salaryArrear = Number(this.updateData.salaryArrear.toFixed(2));
		if (this.updateData.grossSalary !== undefined) dto.grossSalary = Number(this.updateData.grossSalary.toFixed(2));
		if (this.updateData.pfDeduction !== undefined) dto.pfDeduction = Number(this.updateData.pfDeduction.toFixed(2));
		if (this.updateData.gisDeduction !== undefined) dto.gisDeduction = Number(this.updateData.gisDeduction.toFixed(2));
		if (this.updateData.netSalary !== undefined) dto.netSalary = Number(this.updateData.netSalary.toFixed(2));
		if (this.updateData.tds !== undefined) dto.tds = Number(this.updateData.tds.toFixed(2));
		if (this.updateData.healthContribution !== undefined) dto.healthContribution = Number(this.updateData.healthContribution.toFixed(2));
		if (this.updateData.totalPayout !== undefined) dto.totalPayout = Number(this.updateData.totalPayout.toFixed(2));

		this.payscaleService.updateEmployeePayscale(this.userId, dto).subscribe({
			next: (updatedPayscale: EmployeePayscale) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Employee payscale updated successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(updatedPayscale);
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to update employee payscale';
				if (error.error?.message) {
					if (Array.isArray(error.error.message)) {
						errorMessage = error.error.message.join(', ');
					} else if (typeof error.error.message === 'string') {
						errorMessage = error.error.message;
					}
				}
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: errorMessage,
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	close() {
		if (this.ref) {
			this.ref.close();
		}
	}
}
