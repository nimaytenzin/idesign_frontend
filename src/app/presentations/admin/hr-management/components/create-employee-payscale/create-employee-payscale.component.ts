import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EmployeePayscaleService } from '../../../../../core/dataservice/hr-management/employee-profile/employee-payscale.service';
import {
	CreateEmployeePayscaleDto,
	EmployeePayscale,
} from '../../../../../core/dataservice/hr-management/employee-profile/employee-payscale.interface';
import { PrimeNgModules } from '../../../../../primeng.modules';

@Component({
	selector: 'app-create-employee-payscale',
	standalone: true,
	imports: [CommonModule, FormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './create-employee-payscale.component.html',
	styleUrls: ['./create-employee-payscale.component.scss'],
})
export class CreateEmployeePayscaleComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;

	createData: CreateEmployeePayscaleDto = {
		userId: 0,
		basicSalary: 0,
		benefitsAllowance: 0,
		salaryArrear: 0,
		grossSalary: 0,
		pfDeduction: 0,
		gisDeduction: 0,
		netSalary: 0,
		tds: 0,
		healthContribution: 0,
		totalPayout: 0,
	};

	constructor(
		private payscaleService: EmployeePayscaleService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {}

	ngOnInit() {
		if (this.config?.data?.userId) {
			this.createData.userId = this.config.data.userId;
		}
	}

	calculateGrossSalary() {
		this.createData.grossSalary = this.createData.basicSalary + this.createData.benefitsAllowance + (this.createData.salaryArrear || 0);
		this.calculateNetSalary();
	}

	calculateNetSalary() {
		this.createData.netSalary = this.createData.grossSalary - this.createData.pfDeduction - this.createData.gisDeduction;
		this.calculateTotalPayout();
	}

	calculateTotalPayout() {
		this.createData.totalPayout = this.createData.netSalary - this.createData.tds - this.createData.healthContribution;
	}

	savePayscale() {
		this.submitted = true;

		if (!this.createData.userId || this.createData.basicSalary < 0 || this.createData.grossSalary < 0) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please fill in all required fields with valid values',
			});
			return;
		}

		this.loading = true;

		const dto: CreateEmployeePayscaleDto = {
			userId: this.createData.userId,
			basicSalary: Number(this.createData.basicSalary.toFixed(2)),
			benefitsAllowance: Number(this.createData.benefitsAllowance.toFixed(2)),
			salaryArrear: this.createData.salaryArrear ? Number(this.createData.salaryArrear.toFixed(2)) : 0,
			grossSalary: Number(this.createData.grossSalary.toFixed(2)),
			pfDeduction: Number(this.createData.pfDeduction.toFixed(2)),
			gisDeduction: Number(this.createData.gisDeduction.toFixed(2)),
			netSalary: Number(this.createData.netSalary.toFixed(2)),
			tds: Number(this.createData.tds.toFixed(2)),
			healthContribution: Number(this.createData.healthContribution.toFixed(2)),
			totalPayout: Number(this.createData.totalPayout.toFixed(2)),
		};

		this.payscaleService.createEmployeePayscale(dto).subscribe({
			next: (payscale: EmployeePayscale) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Employee payscale created successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(payscale);
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to create employee payscale';
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
