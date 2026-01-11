import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { AuthService } from '../../../core/dataservice/auth/auth.service';
import { EmployeeProfileService } from '../../../core/dataservice/hr-management/employee-profile/employee-profile.service';
import { EmployeeEducationService } from '../../../core/dataservice/hr-management/employee-profile/employee-education.service';
import { EmployeeWorkExperienceService } from '../../../core/dataservice/hr-management/employee-profile/employee-work-experience.service';
import { EmployeePayscaleService } from '../../../core/dataservice/hr-management/employee-profile/employee-payscale.service';
import { PrimeNgModules } from '../../../primeng.modules';
import { User } from '../../../core/dataservice/user/user.interface';
import { EmployeeProfile } from '../../../core/dataservice/hr-management/employee-profile/employee.profile.interface';
import { EmployeeEducation } from '../../../core/dataservice/hr-management/employee-profile/employee.education.interface';
import { EmployeeWorkExperience } from '../../../core/dataservice/hr-management/employee-profile/employee.work-experience.interface';
import { EmployeePayscale } from '../../../core/dataservice/hr-management/employee-profile/employee-payscale.interface';
import { EmployeeStatus, EmployeeEducationLevel, EmployeeEducationStatus } from '../../../core/constants/enums';
import { environment } from '../../../../environments/environment';
import { CreateEmployeeEducationComponent } from '../../admin/hr-management/components/create-employee-education/create-employee-education.component';
import { UpdateEmployeeEducationComponent } from '../../admin/hr-management/components/update-employee-education/update-employee-education.component';
import { CreateEmployeeWorkExperienceComponent } from '../../admin/hr-management/components/create-employee-work-experience/create-employee-work-experience.component';
import { UpdateEmployeeWorkExperienceComponent } from '../../admin/hr-management/components/update-employee-work-experience/update-employee-work-experience.component';
import { CreateEmployeePayscaleComponent } from '../../admin/hr-management/components/create-employee-payscale/create-employee-payscale.component';
import { UpdateEmployeePayscaleComponent } from '../../admin/hr-management/components/update-employee-payscale/update-employee-payscale.component';

@Component({
	selector: 'app-staff-profile',
	standalone: true,
	imports: [CommonModule, PrimeNgModules],
	providers: [MessageService, DialogService, ConfirmationService],
	templateUrl: './staff-profile.component.html',
	styleUrls: ['./staff-profile.component.scss'],
})
export class StaffProfileComponent implements OnInit {
	user: User | null = null;
	userLoading: boolean = false;
	
	employeeProfile: EmployeeProfile | null = null;
	employeeProfileLoading: boolean = false;
	
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
		private authService: AuthService,
		private employeeProfileService: EmployeeProfileService,
		private educationService: EmployeeEducationService,
		private workExperienceService: EmployeeWorkExperienceService,
		private payscaleService: EmployeePayscaleService,
		private messageService: MessageService,
		private dialogService: DialogService,
		private confirmationService: ConfirmationService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadAllData();
	}

	loadAllData() {
		// Get current user ID first
		this.loadUserDetails();
			this.loadEmployeeProfile();
			this.loadPayscale();
			this.loadEducations();
			this.loadWorkExperiences();
	}

	loadUserDetails() {
		this.userLoading = true;
		this.authService.getProfile().subscribe({
			next: (data: User) => {
				this.user = data;
				console.log(this.user);
				this.userLoading = false;
				// Once we have user ID, load other data if not already loading
				if (data.id) {
					if (!this.employeeProfileLoading) {
						this.loadEmployeeProfile();
					}
					if (!this.payscaleLoading) {
						this.loadPayscale();
					}
					if (!this.educationsLoading) {
						this.loadEducations();
					}
					if (!this.workExperiencesLoading) {
						this.loadWorkExperiences();
					}
				}
				this.cdr.markForCheck();
			},
			error: (error: any) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: error.error?.message || 'Failed to load user details',
				});
				this.userLoading = false;
				this.cdr.markForCheck();
			},
		});
	}

	loadEmployeeProfile() {
		const userId = this.user?.id || this.authService.getCurrentUser()?.id;
		if (!userId) {
			// Wait for user details to load first
			return;
		}

		this.employeeProfileLoading = true;
		// Use getMyEmployeeProfile to get full User response and extract employeeProfile
		this.employeeProfileService.getMyEmployeeProfile().subscribe({
			next: (userData: User | EmployeeProfile) => {
				console.log('Employee Profile User Data:', userData);
				// Check if response is EmployeeProfile directly or User with employeeProfile
				if ('employeeProfile' in userData && userData.employeeProfile) {
					// Response is User object with employeeProfile property
					this.employeeProfile = userData.employeeProfile;
					console.log('Employee Profile from User:', userData.employeeProfile);
				} else if ('department' in userData || 'position' in userData) {
					// Response is EmployeeProfile directly
					this.employeeProfile = userData as EmployeeProfile;
					console.log('Employee Profile (direct):', this.employeeProfile);
				} else {
					this.employeeProfile = null;
				}
				// Update user object with employee profile if not already set
				if (this.user && this.employeeProfile) {
					this.user.employeeProfile = this.employeeProfile;
				}
				this.employeeProfileLoading = false;
				this.cdr.detectChanges();
			},
			error: (error: any) => {
				console.error('Employee Profile Error:', error);
				// 404 is expected if employee profile doesn't exist
				if (error.status !== 404) {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to load employee profile',
					});
				}
				this.employeeProfileLoading = false;
				this.cdr.detectChanges();
			},
		});
	}

	getProfileImageUrl(profileImageUrl: string | undefined): string {
		if (!profileImageUrl) return '/assets/images/no-image.png';
		return `${environment.BASEAPI_URL}${profileImageUrl}`;
	}

	loadPayscale() {
		const userId = this.user?.id || this.authService.getCurrentUser()?.id;
		if (!userId) {
			// Wait for user details to load first
			return;
		}
		
		this.payscaleLoading = true;
		this.payscaleService.getEmployeePayscaleByUserId(userId).subscribe({
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
		const userId = this.user?.id || this.authService.getCurrentUser()?.id;
		if (!userId) {
			// Wait for user details to load first
			return;
		}
		
		this.educationsLoading = true;
		this.educationService.getAllEmployeeEducations(userId).subscribe({
			next: (data: EmployeeEducation[]) => {
				this.educations = data;
				this.educationsLoading = false;
				this.cdr.markForCheck();
			},
			error: (error: any) => {
				// 404 is expected if no education records exist
				if (error.status !== 404) {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to load education records',
					});
				}
				this.educationsLoading = false;
				this.cdr.markForCheck();
			},
		});
	}

	loadWorkExperiences() {
		const userId = this.user?.id || this.authService.getCurrentUser()?.id;
		if (!userId) {
			// Wait for user details to load first
			return;
		}
		
		this.workExperiencesLoading = true;
		this.workExperienceService.getAllEmployeeWorkExperiences(userId).subscribe({
			next: (data: EmployeeWorkExperience[]) => {
				this.workExperiences = data;
				this.workExperiencesLoading = false;
				this.cdr.markForCheck();
			},
			error: (error: any) => {
				// 404 is expected if no work experience records exist
				if (error.status !== 404) {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: error.error?.message || 'Failed to load work experience records',
					});
				}
				this.workExperiencesLoading = false;
				this.cdr.markForCheck();
			},
		});
	}

	formatDate(date: Date | string | null | undefined): string {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	formatCurrency(value: number): string {
		return `Nu. ${new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value || 0)}`;
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

	hasEmployeeProfile(): boolean {
		return !!this.employeeProfile && !!this.employeeProfile.id;
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

	// CRUD Operations for Payscale
	createPayscale() {
		const userId = this.user?.id || this.authService.getCurrentUser()?.id;
		if (!userId) return;
		
		const ref = this.dialogService.open(CreateEmployeePayscaleComponent, {
			header: 'Create Employee Payscale',
			width: '700px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { userId: userId },
		});

		ref.onClose.subscribe((payscale) => {
			if (payscale) {
				this.payscale = payscale;
				this.cdr.markForCheck();
			}
		});
	}

	updatePayscale() {
		const userId = this.user?.id || this.authService.getCurrentUser()?.id;
		if (!this.payscale || !userId) return;
		
		const ref = this.dialogService.open(UpdateEmployeePayscaleComponent, {
			header: 'Update Employee Payscale',
			width: '700px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { payscale: this.payscale, userId: userId },
		});

		ref.onClose.subscribe((payscale) => {
			if (payscale) {
				this.payscale = payscale;
				this.cdr.markForCheck();
			}
		});
	}

	// CRUD Operations for Education
	createEducation() {
		const employeeProfileId = this.employeeProfile?.id || this.user?.employeeProfile?.id;
		const userId = this.user?.id || this.authService.getCurrentUser()?.id;
		
		if (!employeeProfileId || !userId) {
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
				employeeProfileId: employeeProfileId!,
				userId: userId!
			},
		});

		ref.onClose.subscribe((education) => {
			if (education) {
				this.loadEducations();
			}
		});
	}

	updateEducation(education: EmployeeEducation) {
		const userId = this.user?.id || this.authService.getCurrentUser()?.id;
		if (!userId) return;
		
		const ref = this.dialogService.open(UpdateEmployeeEducationComponent, {
			header: 'Update Education',
			width: '600px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { education, userId: userId },
		});

		ref.onClose.subscribe((education) => {
			if (education) {
				this.loadEducations();
			}
		});
	}

	deleteEducation(education: EmployeeEducation) {
		const userId = this.user?.id || this.authService.getCurrentUser()?.id;
		if (!userId) return;
		
		this.confirmationService.confirm({
			message: `Are you sure you want to delete the education record "${education.courseTitle}"?`,
			header: 'Confirm Delete',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.educationService.deleteEmployeeEducation(userId, education.id).subscribe({
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

	// CRUD Operations for Work Experience
	createWorkExperience() {
		const employeeProfileId = this.employeeProfile?.id || this.user?.employeeProfile?.id;
		const userId = this.user?.id || this.authService.getCurrentUser()?.id;
		
		if (!employeeProfileId || !userId) {
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
				employeeProfileId: employeeProfileId!,
				userId: userId!
			},
		});

		ref.onClose.subscribe((experience) => {
			if (experience) {
				this.loadWorkExperiences();
			}
		});
	}

	updateWorkExperience(experience: EmployeeWorkExperience) {
		const userId = this.user?.id || this.authService.getCurrentUser()?.id;
		if (!userId) return;
		
		const ref = this.dialogService.open(UpdateEmployeeWorkExperienceComponent, {
			header: 'Update Work Experience',
			width: '600px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { experience, userId: userId },
		});

		ref.onClose.subscribe((experience) => {
			if (experience) {
				this.loadWorkExperiences();
			}
		});
	}

	deleteWorkExperience(experience: EmployeeWorkExperience) {
		const userId = this.user?.id || this.authService.getCurrentUser()?.id;
		if (!userId) return;
		
		this.confirmationService.confirm({
			message: `Are you sure you want to delete the work experience record "${experience.positionTitle}"?`,
			header: 'Confirm Delete',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.workExperienceService.deleteEmployeeWorkExperience(userId, experience.id).subscribe({
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

	editUserDetails() {
		// TODO: Implement edit user details functionality
		this.messageService.add({
			severity: 'info',
			summary: 'Edit',
			detail: 'Edit user details functionality will be implemented',
		});
	}
}
