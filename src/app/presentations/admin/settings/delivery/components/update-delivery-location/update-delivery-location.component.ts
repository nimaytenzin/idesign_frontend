import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import {
	DeliveryLocation,
	DeliveryLocationService,
	UpdateDeliveryLocationDto,
	LocationType,
} from '../../../../../../core/dataservice';
import { PrimeNgModules } from '../../../../../../primeng.modules';

@Component({
	selector: 'app-update-delivery-location',
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './update-delivery-location.component.html',
	styleUrls: ['./update-delivery-location.component.scss'],
})
export class UpdateDeliveryLocationComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	locationForm!: FormGroup;
	location!: DeliveryLocation;

	locationTypes = [
		{ label: 'Dzongkhag', value: LocationType.DZONGKHAG },
		{ label: 'Thromde', value: LocationType.THROMDE },
		{ label: 'Town', value: LocationType.TOWN },
	];

	constructor(
		private locationService: DeliveryLocationService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		private fb: FormBuilder,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {
		if (config?.data?.location) {
			this.location = config.data.location;
		}
		this.initForm();
	}

	initForm() {
		this.locationForm = this.fb.group({
			name: [
				this.location?.name || '',
				[Validators.required, Validators.minLength(2), Validators.maxLength(255)]
			],
			type: [this.location?.type || null, [Validators.required]],
		});
	}

	ngOnInit() {
	}

	saveLocation() {
		this.submitted = true;

		if (this.locationForm.invalid) {
			Object.keys(this.locationForm.controls).forEach((key) => {
				this.locationForm.get(key)?.markAsTouched();
			});
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please fill in all required fields correctly',
			});
			return;
		}

		this.loading = true;
		const formValue = this.locationForm.value;

		const updateData: UpdateDeliveryLocationDto = {
			name: formValue.name,
			type: formValue.type,
		};

		this.locationService.updateLocation(this.location.id, updateData).subscribe({
			next: (data: any) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Location updated successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(data);
				} else {
					this.submitted = false;
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to update location';
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

	isFieldInvalid(fieldName: string): boolean {
		const control = this.locationForm.get(fieldName);
		return !!(control && control.invalid && (control.touched || this.submitted));
	}

	getFieldError(fieldName: string): string {
		const control = this.locationForm.get(fieldName);
		if (control && control.errors && control.touched) {
			if (control.errors['required']) {
				return `${fieldName} is required`;
			}
			if (control.errors['minlength']) {
				return `${fieldName} must be at least ${control.errors['minlength'].requiredLength} characters`;
			}
			if (control.errors['maxlength']) {
				return `${fieldName} must not exceed ${control.errors['maxlength'].requiredLength} characters`;
			}
		}
		return '';
	}

	close() {
		if (this.ref) {
			this.ref.close();
		}
	}
}
