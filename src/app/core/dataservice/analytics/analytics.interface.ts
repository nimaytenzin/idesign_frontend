export enum DeviceType {
	MOBILE = 'MOBILE',
	TABLET = 'TABLET',
	COMPUTER = 'COMPUTER',
	UNKNOWN = 'UNKNOWN',
}

export enum ReferrerSource {
	SEARCH_ENGINE = 'SEARCH_ENGINE',
	SOCIAL_MEDIA = 'SOCIAL_MEDIA',
	DIRECT = 'DIRECT',
	OTHER = 'OTHER',
	UNKNOWN = 'UNKNOWN',
}

export interface CountryStats {
	country: string;
	count: number;
}

export interface DeviceStats {
	deviceType: DeviceType;
	count: number;
}

export interface ReferrerStats {
	referrerSource: ReferrerSource;
	count: number;
}

export interface DistrictStats {
	country: string;
	district: string;
	count: number;
}

export interface VisitorStats {
	totalVisitors: number;
	uniqueVisitors: number;
	visitorsByCountry: CountryStats[];
	visitorsByDevice: DeviceStats[];
	visitorsByReferrer: ReferrerStats[];
	visitorsByDistrict: DistrictStats[];
}

export interface VisitorRecord {
	id: number;
	sessionId: string;
	ipAddress: string;
	country: string | null;
	district: string | null;
	deviceType: DeviceType;
	referrer: string | null;
	referrerSource: ReferrerSource;
	userAgent: string | null;
	visitedAt: string;
	orderId: number | null;
}

export interface VisitorsResponse {
	data: VisitorRecord[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface AnalyticsQueryParams {
	startDate?: string;
	endDate?: string;
	country?: string;
	district?: string;
	deviceType?: DeviceType | string;
	referrerSource?: ReferrerSource | string;
	page?: number;
	limit?: number;
}

export interface TrackVisitorDto {
	sessionId?: string;
	ipAddress?: string;
	userAgent?: string;
	referrer?: string;
	orderId?: number;
}

export enum DateRangePreset {
	TODAY = 'today',
	YESTERDAY = 'yesterday',
	LAST_7_DAYS = 'last7days',
	LAST_30_DAYS = 'last30days',
	THIS_MONTH = 'thisMonth',
	LAST_MONTH = 'lastMonth',
	THIS_YEAR = 'thisYear',
	CUSTOM = 'custom',
}



