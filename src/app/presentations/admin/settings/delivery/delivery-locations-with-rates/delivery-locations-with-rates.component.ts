import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
	DeliveryLocation,
	DeliveryLocationService,
	DeliveryRate,
	DeliveryRateService,
	TransportMode,
	getTransportModeLabel,
	getLocationTypeLabel,
	LocationType,
} from '../../../../../core/dataservice';
import { PrimeNgModules } from '../../../../../primeng.modules';
import { CreateDeliveryLocationComponent } from '../components/create-delivery-location/create-delivery-location.component';
import { CreateDeliveryRateComponent } from '../components/create-delivery-rate/create-delivery-rate.component';
import { UpdateDeliveryLocationComponent } from '../components/update-delivery-location/update-delivery-location.component';
import { UpdateDeliveryRateComponent } from '../components/update-delivery-rate/update-delivery-rate.component';


@Component({
	selector: 'app-delivery-locations-with-rates',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,
		PrimeNgModules,
	],
	providers: [ConfirmationService, MessageService, DialogService],
	templateUrl: './delivery-locations-with-rates.component.html',
	styleUrls: ['./delivery-locations-with-rates.component.scss'],
})
export class DeliveryLocationsWithRatesComponent implements OnInit {
	// Data
	public locations: DeliveryLocation[] = [];
	public selectedLocation: DeliveryLocation | null = null;
	public rates: DeliveryRate[] = [];
	public filteredRates: DeliveryRate[] = [];

	// UI State
	public loading: boolean = false;
	public loadingRates: boolean = false;

	// Selection state
	public dialogRef?: DynamicDialogRef;

	// Transport modes
	public transportModes = [
		{ label: 'Bus', value: TransportMode.BUS },
		{ label: 'Taxi', value: TransportMode.TAXI },
	];

	constructor(
		private locationService: DeliveryLocationService,
		private rateService: DeliveryRateService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private dialogService: DialogService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.loadLocations();
		this.loadRates();
	}

	public loadLocations(): void {
		this.loading = true;
		this.locationService.getLocations().subscribe({
			next: (data) => {
				this.locations = data;
				this.loading = false;
				// Auto-select first location if available
				if (data.length > 0 && !this.selectedLocation) {
					this.selectedLocation = data[0];
					this.filterRatesByLocation();
				}
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load delivery locations',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	public loadRates(): void {
		this.loadingRates = true;
		this.rateService.getDeliveryRates().subscribe({
			next: (data) => {
				this.rates = data;
				this.filterRatesByLocation();
				this.loadingRates = false;
				this.cdr.markForCheck();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load delivery rates',
				});
				this.loadingRates = false;
				this.cdr.markForCheck();
			},
		});
	}

	public onLocationChange(): void {
		this.filterRatesByLocation();
	}

	public filterRatesByLocation(): void {
		if (this.selectedLocation) {
			this.filteredRates = this.rates.filter(
				(rate) => rate.deliveryLocationId === this.selectedLocation!.id
			);
		} else {
			this.filteredRates = [];
		}
	}

	public getRatesByTransportMode(mode: TransportMode): DeliveryRate[] {
		return this.filteredRates.filter((rate) => rate.transportMode === mode);
	}

	public getTransportModeLabel(mode: TransportMode): string {
		return getTransportModeLabel(mode);
	}

	public getLocationTypeLabel(type: LocationType): string {
		return getLocationTypeLabel(type);
	}

	// Location Management
	public openNewLocation(): void {
		this.dialogRef = this.dialogService.open(CreateDeliveryLocationComponent, {
			header: 'New Delivery Location',
			width: '520px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadLocations();
			}
		});
	}

	public editLocation(location: DeliveryLocation): void {
		this.dialogRef = this.dialogService.open(UpdateDeliveryLocationComponent, {
			header: 'Edit Delivery Location',
			width: '520px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { location },
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadLocations();
			}
		});
	}

	public deleteLocation(location: DeliveryLocation): void {
		this.confirmationService.confirm({
			message: `Are you sure you want to delete "${location.name}"? This will also delete all associated rates. This action cannot be undone.`,
			header: 'Delete Location',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.loading = true;
				this.locationService.deleteLocation(location.id).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Location deleted successfully',
						});
						if (this.selectedLocation?.id === location.id) {
							this.selectedLocation = null;
						}
						this.loadLocations();
						this.loadRates();
						this.loading = false;
					},
					error: (error) => {
						let errorMessage = 'Failed to delete location';
						if (error.error?.message) {
							if (typeof error.error.message === 'string') {
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
			},
		});
	}

	// Rate Management
	public openNewRate(): void {
		if (!this.selectedLocation) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Warning',
				detail: 'Please select a delivery location first',
			});
			return;
		}

		this.dialogRef = this.dialogService.open(CreateDeliveryRateComponent, {
			header: 'New Delivery Rate',
			width: '520px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { defaultLocationId: this.selectedLocation.id },
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadRates();
			}
		});
	}

	public editRate(rate: DeliveryRate): void {
		this.dialogRef = this.dialogService.open(UpdateDeliveryRateComponent, {
			header: 'Edit Delivery Rate',
			width: '520px',
			contentStyle: { overflow: 'auto' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: { rate },
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadRates();
			}
		});
	}

	public deleteRate(rate: DeliveryRate): void {
		this.confirmationService.confirm({
			message: `Are you sure you want to delete the rate for ${getTransportModeLabel(rate.transportMode)}?`,
			header: 'Delete Rate',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.loadingRates = true;
				this.rateService.deleteDeliveryRate(rate.id).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Success',
							detail: 'Rate deleted successfully',
						});
						this.loadRates();
						this.loadingRates = false;
					},
					error: (error) => {
						let errorMessage = 'Failed to delete rate';
						if (error.error?.message) {
							if (typeof error.error.message === 'string') {
								errorMessage = error.error.message;
							}
						}
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: errorMessage,
						});
						this.loadingRates = false;
						this.cdr.markForCheck();
					},
				});
			},
		});
	}
}
