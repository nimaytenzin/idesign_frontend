// Import OrderSource from order instead (OrderType is deprecated)
import { OrderSource } from '../order/order.interface';
export { OrderSource };
// Backward compatibility type alias
export type OrderType = OrderSource;

// SMS Template Enums
export enum SmsTriggerEvent {
	ORDER_PLACED = 'ORDER_PLACED',
	PLACED_TO_CONFIRMED = 'PLACED_TO_CONFIRMED',
	CONFIRMED_TO_PROCESSING = 'CONFIRMED_TO_PROCESSING',
	PROCESSING_TO_PACKAGING = 'PROCESSING_TO_PACKAGING',
	PACKAGING_TO_SHIPPED = 'PACKAGING_TO_SHIPPED',
	SHIPPED_TO_DELIVERED = 'SHIPPED_TO_DELIVERED',
	ORDER_CANCELED = 'ORDER_CANCELED',
	PAYMENT_FAILED = 'PAYMENT_FAILED',
	COUNTER_PAYMENT_RECEIPT = 'COUNTER_PAYMENT_RECEIPT',
}

// SMS Template Interfaces
export interface SmsTemplate {
	id: number;
	name: string;
	triggerEvent: SmsTriggerEvent;
	message: string;
	isActive: boolean;
	sendCount: number;
	sendDelay: number;
	orderType: OrderType | null;
	priority: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateSmsTemplateDto {
	name: string;
	triggerEvent: SmsTriggerEvent;
	message: string;
	isActive?: boolean;
	sendCount?: number;
	sendDelay?: number;
	orderType?: OrderType | null;
	priority?: number;
}

export interface UpdateSmsTemplateDto {
	name?: string;
	triggerEvent?: SmsTriggerEvent;
	message?: string;
	isActive?: boolean;
	sendCount?: number;
	sendDelay?: number;
	orderType?: OrderType | null;
	priority?: number;
}

export interface SmsTemplateQueryDto {
	triggerEvent?: SmsTriggerEvent;
	orderType?: OrderType;
	isActive?: boolean;
}

export interface TriggerInfo {
	value: SmsTriggerEvent;
	description: string;
}

export interface PlaceholderInfo {
	name: string;
	description: string;
}

export interface TestSmsTemplateDto {
	orderId: number;
}

export interface TestTemplateResponse {
	renderedMessage: string;
	template: SmsTemplate;
}

