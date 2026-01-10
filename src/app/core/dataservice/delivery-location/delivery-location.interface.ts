// Enums
export enum LocationType {
	DZONGKHAG = 'DZONGKHAG',
	THROMDE = 'THROMDE',
	TOWN = 'TOWN',
}

// Entity
export interface DeliveryLocation {
	id: number;
	name: string;
	type: LocationType;
	createdAt: Date | string;
	updatedAt: Date | string;
	deliveryRates?: any[]; // DeliveryRate[] - avoiding circular dependency
}

// DTOs
export interface CreateDeliveryLocationDto {
	name: string;
	type: LocationType;
}

export interface UpdateDeliveryLocationDto {
	name?: string;
	type?: LocationType;
}

// Helper functions for display
export function getLocationTypeLabel(type: LocationType): string {
	const labels: Record<LocationType, string> = {
		[LocationType.DZONGKHAG]: 'Dzongkhag',
		[LocationType.THROMDE]: 'Thromde',
		[LocationType.TOWN]: 'Town',
	};
	return labels[type] || type;
}

