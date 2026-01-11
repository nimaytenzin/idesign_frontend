import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PrimeNgModules } from '../../../../../primeng.modules';
import { User } from '../../../../../core/dataservice/user/user.interface';
import { EmployeeStatus, EmployeeEducationLevel, EmployeeEducationStatus } from '../../../../../core/constants/enums';
import { environment } from '../../../../../../environments/environment';
import { EmployeePayscaleService } from '../../../../../core/dataservice/hr-management/employee-profile/employee-payscale.service';
import { EmployeeEducationService } from '../../../../../core/dataservice/hr-management/employee-profile/employee-education.service';
import { EmployeeWorkExperienceService } from '../../../../../core/dataservice/hr-management/employee-profile/employee-work-experience.service';
import { EmployeeProfileService } from '../../../../../core/dataservice/hr-management/employee-profile/employee-profile.service';
import { EmployeePayscale } from '../../../../../core/dataservice/hr-management/employee-profile/employee-payscale.interface';
import { EmployeeEducation } from '../../../../../core/dataservice/hr-management/employee-profile/employee.education.interface';
import { EmployeeWorkExperience } from '../../../../../core/dataservice/hr-management/employee-profile/employee.work-experience.interface';
import { CreateEmployeePayscaleComponent } from '../create-employee-payscale/create-employee-payscale.component';
import { UpdateEmployeePayscaleComponent } from '../update-employee-payscale/update-employee-payscale.component';
import { CreateEmployeeEducationComponent } from '../create-employee-education/create-employee-education.component';
import { UpdateEmployeeEducationComponent } from '../update-employee-education/update-employee-education.component';
import { CreateEmployeeWorkExperienceComponent } from '../create-employee-work-experience/create-employee-work-experience.component';
import { UpdateEmployeeWorkExperienceComponent } from '../update-employee-work-experience/update-employee-work-experience.component';
import { CreateEmployeeProfileComponent } from '../create-employee-profile/create-employee-profile.component';
import { UpdateEmployeeProfileComponent } from '../update-employee-profile/update-employee-profile.component';

@Component({
	selector: 'app-admin-view-employee-card',
	standalone: true,
	imports: [CommonModule, PrimeNgModules],
	providers: [MessageService, DialogService, ConfirmationService],
	templateUrl: './admin-view-employee-card.component.html',
	styleUrls: ['./admin-view-employee-card.component.scss'],
})
export class AdminViewEmployeeCardComponent implements OnInit {
	staff: User | null = null;
	
	payscale: EmployeePayscale | null = null;
	payscaleLoading: boolean = false;
	
	educations: EmployeeEducation[] = [];
	educationsLoading: boolean = false;
	
	workExperiences: EmployeeWorkExperience[] = [];
	workExperiencesLoading: boolean = false;

	// Expose enums for template
	readonly EmployeeStatus = EmployeeStatus;
	readonly EmployeeEducationLevel = EmployeeEducationLevel;
	readonly EmployeeEducationStatus = EmployeeEducationStatus;

	constructor(
		private payscaleService: EmployeePayscaleService,
		private educationService: EmployeeEducationService,
		private workExperienceService: EmployeeWorkExperienceService,
		private profileService: EmployeeProfileService,
		private messageService: MessageService,
		private dialogService: DialogService,
		private confirmationService: ConfirmationService,
		private cdr: ChangeDetectorRef,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {}

	ngOnInit() {
		if (this.config?.data) {
			this.staff = this.config.data.staff;
			if (this.staff?.id) {
				this.loadPayscale();
				this.loadEducations();
				this.loadWorkExperiences();
			}
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

	loadPayscale() {
		if (!this.staff?.id) return;
		
		this.payscaleLoading = true;
		this.payscaleService.getEmployeePayscaleByUserId(this.staff.id).subscribe({
			next: (data: EmployeePayscale) => {
				this.payscale = data;
				this.payscaleLoading = false;
				this.cdr.markForCheck();
			},
			error: (error: any) => {
				// 404 is expected if payscale doesn't exist
				if (error.status !== 404) {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to load payscale',
					});
				}
				this.payscaleLoading = false;
				this.cdr.markForCheck();
			},
		});
	}

	loadEducations() {
		if (!this.staff?.id) return;
		
		this.educationsLoading = true;
		this.educationService.getAllEmployeeEducations(this.staff.id).subscribe({
			next: (data: EmployeeEducation[]) => {
				this.educations = data;
				this.educationsLoading = false;
				this.cdr.markForCheck();
			},
			error: (error: any) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load education records',
				});
				this.educationsLoading = false;
				this.cdr.markForCheck();
			},
		});
	}

	loadWorkExperiences() {
		if (!this.staff?.id) return;
		
		this.workExperiencesLoading = true;
		this.workExperienceService.getAllEmployeeWorkExperiences(this.staff.id).subscribe({
			next: (data: EmployeeWorkExperience[]) => {
				this.workExperiences = data;
				this.workExperiencesLoading = false;
				this.cdr.markForCheck();
			},
			error: (error: any) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load work experience records',
				});
				this.workExperiencesLoading = false;
				this.cdr.markForCheck();
			},
		});
	}

	formatCurrency(value: number): string {
		return `Nu. ${new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value || 0)}`;
	}

	formatEducationLevel(level: EmployeeEducationLevel): string {
		const levelMap: { [key: string]: string } = {
			'PRIMARY': 'Primary',
			'SECONDARY': 'Secondary',
			'DIPLOMA': 'Diploma',
			'CERTIFICATE': 'Certificate',
			'BACHELOR': 'Bachelor',
			'MASTER': 'Master',
			'PHD': 'PhD',
		};
		return levelMap[level] || level;
	}

	formatEducationStatus(status: EmployeeEducationStatus): string {
		return status === 'COMPLETED' ? 'Completed' : 'Incomplete';
	}

	// CRUD Operations
	createEmployeeProfile() {
		if (!this.staff?.id) return;
		
		const ref = this.dialogService.open(CreateEmployeeProfileComponent, {
			header: 'Create Employee Profile',
			width: '600px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { userId: this.staff.id },
		});

		ref.onClose.subscribe((profile) => {
			if (profile) {
				this.staff!.employeeProfile = profile;
				this.cdr.markForCheck();
			}
		});
	}

	updateEmployeeProfile() {
		if (!this.staff?.employeeProfile) return;
		
		const ref = this.dialogService.open(UpdateEmployeeProfileComponent, {
			header: 'Update Employee Profile',
			width: '600px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { employeeProfile: this.staff.employeeProfile },
		});

		ref.onClose.subscribe((profile) => {
			if (profile) {
				this.staff!.employeeProfile = profile;
				this.cdr.markForCheck();
			}
		});
	}

	createPayscale() {
		if (!this.staff?.id) return;
		
		const ref = this.dialogService.open(CreateEmployeePayscaleComponent, {
			header: 'Create Employee Payscale',
			width: '700px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { userId: this.staff.id },
		});

		ref.onClose.subscribe((payscale) => {
			if (payscale) {
				this.payscale = payscale;
				this.cdr.markForCheck();
			}
		});
	}

	updatePayscale() {
		if (!this.payscale || !this.staff?.id) return;
		
		const ref = this.dialogService.open(UpdateEmployeePayscaleComponent, {
			header: 'Update Employee Payscale',
			width: '700px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { payscale: this.payscale, userId: this.staff.id },
		});

		ref.onClose.subscribe((payscale) => {
			if (payscale) {
				this.payscale = payscale;
				this.cdr.markForCheck();
			}
		});
	}

	createEducation() {
		if (!this.staff?.employeeProfile?.id || !this.staff?.id) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Warning',
				detail: 'Employee profile must exist before adding education',
			});
			return;
		}
		
		const ref = this.dialogService.open(CreateEmployeeEducationComponent, {
			header: 'Add Education',
			width: '600px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { 
				employeeProfileId: this.staff.employeeProfile.id,
				userId: this.staff.id
			},
		});

		ref.onClose.subscribe((education) => {
			if (education) {
				this.loadEducations();
			}
		});
	}

	updateEducation(education: EmployeeEducation) {
		const ref = this.dialogService.open(UpdateEmployeeEducationComponent, {
			header: 'Update Education',
			width: '600px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { education, userId: this.staff!.id },
		});

		ref.onClose.subscribe((education) => {
			if (education) {
				this.loadEducations();
			}
		});
	}

	deleteEducation(education: EmployeeEducation) {
		if (!this.staff?.id) return;
		
		this.confirmationService.confirm({
			message: `Are you sure you want to delete the education record "${education.courseTitle}"?`,
			header: 'Confirm Delete',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.educationService.deleteEmployeeEducation(this.staff!.id, education.id).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Education record deleted successfully',
						});
						this.loadEducations();
					},
					error: (error: any) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: error.error?.message || 'Failed to delete education record',
						});
					},
				});
			},
		});
	}

	createWorkExperience() {
		if (!this.staff?.employeeProfile?.id || !this.staff?.id) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Warning',
				detail: 'Employee profile must exist before adding work experience',
			});
			return;
		}
		
		const ref = this.dialogService.open(CreateEmployeeWorkExperienceComponent, {
			header: 'Add Work Experience',
			width: '600px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { 
				employeeProfileId: this.staff.employeeProfile.id,
				userId: this.staff.id
			},
		});

		ref.onClose.subscribe((experience) => {
			if (experience) {
				this.loadWorkExperiences();
			}
		});
	}

	updateWorkExperience(experience: EmployeeWorkExperience) {
		const ref = this.dialogService.open(UpdateEmployeeWorkExperienceComponent, {
			header: 'Update Work Experience',
			width: '600px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { experience, userId: this.staff!.id },
		});

		ref.onClose.subscribe((experience) => {
			if (experience) {
				this.loadWorkExperiences();
			}
		});
	}

	deleteWorkExperience(experience: EmployeeWorkExperience) {
		if (!this.staff?.id) return;
		
		this.confirmationService.confirm({
			message: `Are you sure you want to delete the work experience record "${experience.positionTitle}"?`,
			header: 'Confirm Delete',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.workExperienceService.deleteEmployeeWorkExperience(this.staff!.id, experience.id).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Work experience record deleted successfully',
						});
						this.loadWorkExperiences();
					},
					error: (error: any) => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: error.error?.message || 'Failed to delete work experience record',
						});
					},
				});
			},
		});
	}

	close() {
		if (this.ref) {
			this.ref.close();
		}
	}
}
