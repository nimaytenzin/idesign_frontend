import { Component, OnInit, ChangeDetectorRef, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DeliveryRate, DeliveryRateService, DeliveryLocationService, UpdateDeliveryRateDto, TransportMode } from '../../../../../../core/dataservice';
import { PrimeNgModules } from '../../../../../../primeng.modules';

@Component({
	selector: 'app-update-delivery-rate',
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule, PrimeNgModules],
	providers: [MessageService],
	templateUrl: './update-delivery-rate.component.html',
	styleUrls: ['./update-delivery-rate.component.scss'],
})
export class UpdateDeliveryRateComponent implements OnInit {
	loading: boolean = false;
	submitted: boolean = false;
	rateForm!: FormGroup;
	rate!: DeliveryRate;
	locations: any[] = [];
	loadingLocations: boolean = false;

	transportModes = [
		{ label: 'Bus', value: TransportMode.BUS },
		{ label: 'Taxi', value: TransportMode.TAXI },
	];

	constructor(
		private rateService: DeliveryRateService,
		private locationService: DeliveryLocationService,
		private messageService: MessageService,
		private cdr: ChangeDetectorRef,
		private fb: FormBuilder,
		@Optional() public ref?: DynamicDialogRef,
		@Optional() public config?: DynamicDialogConfig
	) {
		if (config?.data?.rate) {
			this.rate = config.data.rate;
		}
		this.initForm();
	}

	initForm() {
		this.rateForm = this.fb.group({
			deliveryLocationId: [this.rate?.deliveryLocationId || null, [Validators.required]],
			transportMode: [this.rate?.transportMode || null, [Validators.required]],
			rate: [this.rate?.rate || 0, [Validators.required, Validators.min(0)]],
		});
	}

	ngOnInit() {
		this.loadLocations();
	}

	loadLocations(): void {
		this.loadingLocations = true;
		this.locationService.getLocations().subscribe({
			next: (data) => {
				this.locations = data.map(loc => ({
					label: `${loc.name} (${loc.type})`,
					value: loc.id
				}));
				this.loadingLocations = false;
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load locations',
				});
				this.loadingLocations = false;
				this.cdr.markForCheck();
			},
		});
	}

	saveRate() {
		this.submitted = true;

		if (this.rateForm.invalid) {
			Object.keys(this.rateForm.controls).forEach((key) => {
				this.rateForm.get(key)?.markAsTouched();
			});
			this.messageService.add({
				severity: 'warn',
				summary: 'Validation Error',
				detail: 'Please fill in all required fields correctly',
			});
			return;
		}

		this.loading = true;
		const formValue = this.rateForm.value;

		const updateData: UpdateDeliveryRateDto = {
			deliveryLocationId: formValue.deliveryLocationId,
			transportMode: formValue.transportMode,
			rate: formValue.rate,
		};

		this.rateService.updateDeliveryRate(this.rate.id, updateData).subscribe({
			next: (data: any) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Rate updated successfully',
				});
				this.loading = false;
				if (this.ref) {
					this.ref.close(data);
				} else {
					this.submitted = false;
				}
			},
			error: (error: any) => {
				let errorMessage = 'Failed to update rate';
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
		const control = this.rateForm.get(fieldName);
		return !!(control && control.invalid && (control.touched || this.submitted));
	}

	getFieldError(fieldName: string): string {
		const control = this.rateForm.get(fieldName);
		if (control && control.errors && control.touched) {
			if (control.errors['required']) {
				return `${fieldName} is required`;
			}
			if (control.errors['min']) {
				return `${fieldName} must be at least ${control.errors['min'].min}`;
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
