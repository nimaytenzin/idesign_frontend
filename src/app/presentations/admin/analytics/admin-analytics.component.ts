import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PrimeNgModules } from '../../../primeng.modules';
import { AnalyticsService } from '../../../core/dataservice/analytics/analytics.service';
import { OrderService } from '../../../core/dataservice/order/order.service';
import {
	VisitorStats,
	CountryStats,
	DeviceStats,
	ReferrerStats,
	DistrictStats,
	VisitorRecord,
	VisitorsResponse,
	AnalyticsQueryParams,
	DateRangePreset,
	DeviceType,
	ReferrerSource,
} from '../../../core/dataservice/analytics/analytics.interface';
import { Subject, debounceTime, takeUntil } from 'rxjs';

interface OverviewMetrics {
	totalVisitors: number;
	uniqueVisitors: number;
	conversionRate: number;
	totalOrders: number;
}

@Component({
	selector: 'app-admin-analytics',
	imports: [CommonModule, FormsModule, RouterModule, PrimeNgModules],
	templateUrl: './admin-analytics.component.html',
	styleUrl: './admin-analytics.component.scss',
})
export class AdminAnalyticsComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();

	// Overview metrics
	overviewMetrics: OverviewMetrics = {
		totalVisitors: 0,
		uniqueVisitors: 0,
		conversionRate: 0,
		totalOrders: 0,
	};

	// Chart data
	countryChartData: any = {};
	deviceChartData: any = {};
	referrerChartData: any = {};
	trendChartData: any = {};

	// Chart options
	countryChartOptions: any = {};
	deviceChartOptions: any = {};
	referrerChartOptions: any = {};
	trendChartOptions: any = {};

	// District data
	districtData: DistrictStats[] = [];
	selectedCountryForDistrict: string | null = null;
	availableCountries: string[] = [];

	// Visitors table
	visitors: VisitorRecord[] = [];
	totalVisitors: number = 0;
	page: number = 1;
	limit: number = 50;
	totalPages: number = 0;

	// Filters
	filters: AnalyticsQueryParams = {};
	dateRangePreset: DateRangePreset = DateRangePreset.LAST_30_DAYS;
	startDate: Date | null = null;
	endDate: Date | null = null;
	selectedCountry: string | null = null;
	selectedDeviceTypes: DeviceType[] = [];
	selectedReferrerSources: ReferrerSource[] = [];

	// Loading states
	loadingStats: boolean = false;
	loadingCharts: boolean = false;
	loadingVisitors: boolean = false;

	// Device and Referrer options
	deviceTypeOptions = [
		{ label: 'Mobile', value: DeviceType.MOBILE },
		{ label: 'Tablet', value: DeviceType.TABLET },
		{ label: 'Computer', value: DeviceType.COMPUTER },
		{ label: 'Unknown', value: DeviceType.UNKNOWN },
	];

	// Expose enums to template
	DeviceType = DeviceType;

	referrerSourceOptions = [
		{ label: 'Direct', value: ReferrerSource.DIRECT },
		{ label: 'Search Engine', value: ReferrerSource.SEARCH_ENGINE },
		{ label: 'Social Media', value: ReferrerSource.SOCIAL_MEDIA },
		{ label: 'Other', value: ReferrerSource.OTHER },
		{ label: 'Unknown', value: ReferrerSource.UNKNOWN },
	];

	dateRangePresets = [
		{ label: 'Today', value: DateRangePreset.TODAY },
		{ label: 'Yesterday', value: DateRangePreset.YESTERDAY },
		{ label: 'Last 7 Days', value: DateRangePreset.LAST_7_DAYS },
		{ label: 'Last 30 Days', value: DateRangePreset.LAST_30_DAYS },
		{ label: 'This Month', value: DateRangePreset.THIS_MONTH },
		{ label: 'Last Month', value: DateRangePreset.LAST_MONTH },
		{ label: 'This Year', value: DateRangePreset.THIS_YEAR },
		{ label: 'Custom', value: DateRangePreset.CUSTOM },
	];

	constructor(
		private analyticsService: AnalyticsService,
		private orderService: OrderService
	) {}

	ngOnInit() {
		this.initializeDateRange();
		this.loadAllData();
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	initializeDateRange() {
		const endDate = new Date();
		endDate.setHours(23, 59, 59, 999);
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - 30);
		startDate.setHours(0, 0, 0, 0);
		this.startDate = startDate;
		this.endDate = endDate;
		this.updateFilters();
	}

	onDateRangePresetChange() {
		const endDate = new Date();
		const startDate = new Date();

		switch (this.dateRangePreset) {
			case DateRangePreset.TODAY:
				startDate.setHours(0, 0, 0, 0);
				endDate.setHours(23, 59, 59, 999);
				break;
			case DateRangePreset.YESTERDAY:
				startDate.setDate(startDate.getDate() - 1);
				startDate.setHours(0, 0, 0, 0);
				endDate.setDate(endDate.getDate() - 1);
				endDate.setHours(23, 59, 59, 999);
				break;
			case DateRangePreset.LAST_7_DAYS:
				startDate.setDate(startDate.getDate() - 7);
				break;
			case DateRangePreset.LAST_30_DAYS:
				startDate.setDate(startDate.getDate() - 30);
				break;
			case DateRangePreset.THIS_MONTH:
				startDate.setDate(1);
				startDate.setHours(0, 0, 0, 0);
				break;
			case DateRangePreset.LAST_MONTH:
				startDate.setMonth(startDate.getMonth() - 1);
				startDate.setDate(1);
				startDate.setHours(0, 0, 0, 0);
				endDate.setDate(0);
				endDate.setHours(23, 59, 59, 999);
				break;
			case DateRangePreset.THIS_YEAR:
				startDate.setMonth(0, 1);
				startDate.setHours(0, 0, 0, 0);
				break;
			case DateRangePreset.CUSTOM:
				// Keep current dates
				return;
		}

		this.startDate = startDate;
		this.endDate = endDate;
		this.updateFilters();
		this.loadAllData();
	}

	onCustomDateChange() {
		if (this.startDate && this.endDate) {
			this.dateRangePreset = DateRangePreset.CUSTOM;
			this.updateFilters();
			this.loadAllData();
		}
	}

	updateFilters() {
		this.filters = {
			startDate: this.startDate ? this.startDate.toISOString() : undefined,
			endDate: this.endDate ? this.endDate.toISOString() : undefined,
			country: this.selectedCountry || undefined,
			deviceType: this.selectedDeviceTypes.length > 0 ? this.selectedDeviceTypes.join(',') : undefined,
			referrerSource:
				this.selectedReferrerSources.length > 0
					? this.selectedReferrerSources.join(',')
					: undefined,
		};
	}

	loadAllData() {
		this.loadOverviewMetrics();
		this.loadCharts();
		this.loadDistrictData();
		this.loadVisitors();
	}

	loadOverviewMetrics() {
		this.loadingStats = true;
		this.analyticsService
			.getVisitorStats(this.filters)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (stats) => {
					this.overviewMetrics.totalVisitors = stats.totalVisitors;
					this.overviewMetrics.uniqueVisitors = stats.uniqueVisitors;

					// Load orders for conversion rate
					this.orderService
						.getOrders({
							startDate: this.filters.startDate,
							endDate: this.filters.endDate,
						})
						.pipe(takeUntil(this.destroy$))
						.subscribe({
							next: (orders) => {
								this.overviewMetrics.totalOrders = orders.length;
								this.overviewMetrics.conversionRate =
									stats.totalVisitors > 0
										? (orders.length / stats.totalVisitors) * 100
										: 0;
								this.loadingStats = false;
							},
							error: () => {
								this.loadingStats = false;
							},
						});
				},
				error: () => {
					this.loadingStats = false;
				},
			});
	}

	loadCharts() {
		this.loadingCharts = true;
		this.loadCountryChart();
		this.loadDeviceChart();
		this.loadReferrerChart();
		this.loadTrendChart();
	}

	loadCountryChart() {
		this.analyticsService
			.getVisitorsByCountry(this.filters)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (data) => {
					// Sort by count descending and take top 10
					const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 10);
					this.countryChartData = {
						labels: sortedData.map((item) => item.country),
						datasets: [
							{
								label: 'Visitors',
								data: sortedData.map((item) => item.count),
								backgroundColor: 'rgba(59, 130, 246, 0.5)',
								borderColor: 'rgba(59, 130, 246, 1)',
								borderWidth: 2,
							},
						],
					};
					this.countryChartOptions = this.getBarChartOptions('Visitors by Country');
					this.loadingCharts = false;
				},
				error: () => {
					this.loadingCharts = false;
				},
			});
	}

	loadDeviceChart() {
		this.analyticsService
			.getVisitorsByDevice(this.filters)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (data) => {
					const deviceLabels: { [key: string]: string } = {
						[DeviceType.MOBILE]: 'Mobile',
						[DeviceType.TABLET]: 'Tablet',
						[DeviceType.COMPUTER]: 'Computer',
						[DeviceType.UNKNOWN]: 'Unknown',
					};

					this.deviceChartData = {
						labels: data.map((item) => deviceLabels[item.deviceType] || item.deviceType),
						datasets: [
							{
								data: data.map((item) => item.count),
								backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#6b7280'],
								borderWidth: 2,
								borderColor: '#ffffff',
							},
						],
					};
					this.deviceChartOptions = this.getPieChartOptions('Visitors by Device');
				},
			});
	}

	loadReferrerChart() {
		this.analyticsService
			.getVisitorsByReferrer(this.filters)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (data) => {
					const referrerLabels: { [key: string]: string } = {
						[ReferrerSource.DIRECT]: 'Direct',
						[ReferrerSource.SEARCH_ENGINE]: 'Search Engine',
						[ReferrerSource.SOCIAL_MEDIA]: 'Social Media',
						[ReferrerSource.OTHER]: 'Other',
						[ReferrerSource.UNKNOWN]: 'Unknown',
					};

					// Sort by count descending
					const sortedData = [...data].sort((a, b) => b.count - a.count);

					this.referrerChartData = {
						labels: sortedData.map((item) => referrerLabels[item.referrerSource] || item.referrerSource),
						datasets: [
							{
								label: 'Visitors',
								data: sortedData.map((item) => item.count),
								backgroundColor: [
									'rgba(59, 130, 246, 0.5)',
									'rgba(16, 185, 129, 0.5)',
									'rgba(245, 158, 11, 0.5)',
									'rgba(107, 114, 128, 0.5)',
									'rgba(156, 163, 175, 0.5)',
								],
								borderColor: [
									'rgba(59, 130, 246, 1)',
									'rgba(16, 185, 129, 1)',
									'rgba(245, 158, 11, 1)',
									'rgba(107, 114, 128, 1)',
									'rgba(156, 163, 175, 1)',
								],
								borderWidth: 2,
							},
						],
					};
					this.referrerChartOptions = this.getHorizontalBarChartOptions('Visitors by Referrer Source');
				},
			});
	}

	loadTrendChart() {
		// For trend chart, we'll use the visitors list and aggregate by date
		this.analyticsService
			.getVisitors({ ...this.filters, limit: 1000 })
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response) => {
					// Group by date
					const dateMap = new Map<string, { visitors: number; unique: Set<string> }>();
					response.data.forEach((visitor) => {
						const date = new Date(visitor.visitedAt).toISOString().split('T')[0];
						if (!dateMap.has(date)) {
							dateMap.set(date, { visitors: 0, unique: new Set() });
						}
						const entry = dateMap.get(date)!;
						entry.visitors++;
						entry.unique.add(visitor.sessionId);
					});

					const sortedDates = Array.from(dateMap.keys()).sort();
					this.trendChartData = {
						labels: sortedDates,
						datasets: [
							{
								label: 'Total Visitors',
								data: sortedDates.map((date) => dateMap.get(date)!.visitors),
								borderColor: 'rgba(59, 130, 246, 1)',
								backgroundColor: 'rgba(59, 130, 246, 0.1)',
								tension: 0.4,
								fill: true,
							},
							{
								label: 'Unique Visitors',
								data: sortedDates.map((date) => dateMap.get(date)!.unique.size),
								borderColor: 'rgba(16, 185, 129, 1)',
								backgroundColor: 'rgba(16, 185, 129, 0.1)',
								tension: 0.4,
								fill: true,
							},
						],
					};
					this.trendChartOptions = this.getLineChartOptions('Visitor Trends');
				},
			});
	}

	loadDistrictData() {
		this.analyticsService
			.getVisitorsByDistrict(this.selectedCountryForDistrict || undefined, this.filters)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (data) => {
					this.districtData = data.sort((a, b) => b.count - a.count);
					// Extract unique countries for dropdown
					this.availableCountries = [
						...new Set(data.map((item) => item.country)),
					].sort();
				},
			});
	}

	loadVisitors() {
		this.loadingVisitors = true;
		this.analyticsService
			.getVisitors({ ...this.filters, page: this.page, limit: this.limit })
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response) => {
					this.visitors = response.data;
					this.totalVisitors = response.total;
					this.totalPages = response.totalPages;
					this.loadingVisitors = false;
				},
				error: () => {
					this.loadingVisitors = false;
				},
			});
	}

	onFilterChange() {
		this.updateFilters();
		this.loadAllData();
	}

	onPageChange(event: any) {
		this.page = event.page + 1;
		this.loadVisitors();
	}

	onDistrictCountryChange() {
		this.loadDistrictData();
	}

	// Chart options helpers
	getBarChartOptions(title: string): any {
		return {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: false,
				},
				title: {
					display: true,
					text: title,
				},
			},
			scales: {
				y: {
					beginAtZero: true,
					grid: {
						display: false,
					},
					border: {
						display: false,
					},
				},
				x: {
					grid: {
						display: false,
					},
					border: {
						display: false,
					},
				},
			},
		};
	}

	getPieChartOptions(title: string): any {
		return {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					position: 'bottom',
				},
				title: {
					display: true,
					text: title,
				},
			},
		};
	}

	getHorizontalBarChartOptions(title: string): any {
		return {
			indexAxis: 'y',
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: false,
				},
				title: {
					display: true,
					text: title,
				},
			},
			scales: {
				x: {
					beginAtZero: true,
					grid: {
						display: false,
					},
					border: {
						display: false,
					},
				},
				y: {
					grid: {
						display: false,
					},
					border: {
						display: false,
					},
				},
			},
		};
	}

	getLineChartOptions(title: string): any {
		return {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					position: 'top',
				},
				title: {
					display: true,
					text: title,
				},
			},
			scales: {
				y: {
					beginAtZero: true,
					grid: {
						display: false,
					},
					border: {
						display: false,
					},
				},
				x: {
					grid: {
						display: false,
					},
					border: {
						display: false,
					},
				},
			},
			elements: {
				line: {
					tension: 0.4,
					borderWidth: 2,
				},
				point: {
					radius: 3,
				},
			},
		};
	}

	// Utility methods
	formatNumber(num: number): string {
		return num.toLocaleString();
	}

	formatPercentage(num: number): string {
		return num.toFixed(2) + '%';
	}

	formatDate(dateString: string): string {
		return new Date(dateString).toLocaleString();
	}

	getDeviceTypeLabel(deviceType: DeviceType): string {
		const labels: { [key: string]: string } = {
			[DeviceType.MOBILE]: 'Mobile',
			[DeviceType.TABLET]: 'Tablet',
			[DeviceType.COMPUTER]: 'Computer',
			[DeviceType.UNKNOWN]: 'Unknown',
		};
		return labels[deviceType] || deviceType;
	}

	getReferrerSourceLabel(referrerSource: ReferrerSource): string {
		const labels: { [key: string]: string } = {
			[ReferrerSource.DIRECT]: 'Direct',
			[ReferrerSource.SEARCH_ENGINE]: 'Search Engine',
			[ReferrerSource.SOCIAL_MEDIA]: 'Social Media',
			[ReferrerSource.OTHER]: 'Other',
			[ReferrerSource.UNKNOWN]: 'Unknown',
		};
		return labels[referrerSource] || referrerSource;
	}

	exportToCSV() {
		// Simple CSV export for visitors table
		const headers = [
			'Date',
			'Country',
			'District',
			'Device Type',
			'Referrer Source',
			'IP Address',
			'Order ID',
		];
		const rows = this.visitors.map((v) => [
			v.visitedAt,
			v.country || 'N/A',
			v.district || 'N/A',
			this.getDeviceTypeLabel(v.deviceType),
			this.getReferrerSourceLabel(v.referrerSource),
			v.ipAddress,
			v.orderId || 'N/A',
		]);

		const csvContent = [headers, ...rows]
			.map((row) => row.map((cell) => `"${cell}"`).join(','))
			.join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `visitors-${new Date().toISOString().split('T')[0]}.csv`;
		link.click();
		window.URL.revokeObjectURL(url);
	}
}

