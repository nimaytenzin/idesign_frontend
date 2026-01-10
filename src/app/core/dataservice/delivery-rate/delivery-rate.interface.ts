// Enums
export enum TransportMode {
	BUS = 'BUS',
	TAXI = 'TAXI',
}

// Entity
export interface DeliveryRate {
	id: number;
	deliveryLocationId: number;
	transportMode: TransportMode;
	rate: number;
	createdAt: Date | string;
	updatedAt: Date | string;
	deliveryLocation?: any; // DeliveryLocation - avoiding circular dependency
}

// DTOs
export interface CreateDeliveryRateDto {
	deliveryLocationId: number;
	transportMode: TransportMode;
	rate: number;
}

export interface UpdateDeliveryRateDto {
	deliveryLocationId?: number;
	transportMode?: TransportMode;
	rate?: number;
}

// Helper functions for display
export function getTransportModeLabel(mode: TransportMode): string {
	const labels: Record<TransportMode, string> = {
		[TransportMode.BUS]: 'Bus',
		[TransportMode.TAXI]: 'Taxi',
	};
	return labels[mode] || mode;
}

