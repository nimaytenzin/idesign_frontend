import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PrimeNgModules } from '../../../primeng.modules';
import { getExpenseSubtypeLabel } from '../../../core/constants/expense-categories.constants';
import { OrderService } from '../../../core/dataservice/order/order.service';
import { ExpenseService } from '../../../core/dataservice/expense/expense.service';
import { CalendarEventService } from '../../../core/dataservice/calendar/calendar-event.service';
import { Order } from '../../../core/dataservice/order/order.interface';
import { Expense } from '../../../core/dataservice/expense/expense.interface';
import { CalendarEventResponseDto } from '../../../core/dataservice/calendar/calendar-event.interface';

interface DashboardStats {
	totalRevenue: number;
	totalOrders: number;
	totalExpenses: number;
	totalToCollect: number;
	pendingOrders: number;
	todayOrders: number;
	ordersToShip: number;
	expensesThisMonth: number;
}

interface RecentOrder {
	id: number;
	orderNumber: string;
	customerName: string;
	itemCount: number;
	total: number;
	fulfillmentStatus: string;
	paymentStatus: string;
	placedAt: Date | string | null;
}

interface RecentExpense {
	description: string;
	amount: number;
	type?: string;
	subtype?: string;
	date: string;
}

interface FinancialSummaryRow {
	item: string;
	value: number;
	isNetProfit: boolean;
}

interface FinancialSummaryPeriod {
	periodLabel: string;
	periodBg: string;
	netProfitRowBg: string;
	rows: FinancialSummaryRow[];
}

@Component({
	selector: 'app-admin-dashboard',
	imports: [CommonModule, FormsModule, RouterModule, PrimeNgModules],
	templateUrl: './admin-dashboard.component.html',
	styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
	byMonthYear = new Date().getFullYear();
	byMonthMonth = new Date().getMonth() + 1;
	/** Bound to p-calendar (month picker); first day of selected month. */
	selectedMonthDate = new Date(this.byMonthYear, this.byMonthMonth - 1, 1);
	monthOptions = [
		{ label: 'January', value: 1 }, { label: 'February', value: 2 }, { label: 'March', value: 3 },
		{ label: 'April', value: 4 }, { label: 'May', value: 5 }, { label: 'June', value: 6 },
		{ label: 'July', value: 7 }, { label: 'August', value: 8 }, { label: 'September', value: 9 },
		{ label: 'October', value: 10 }, { label: 'November', value: 11 }, { label: 'December', value: 12 },
	];
	loading = false;

	stats: DashboardStats = {
		totalRevenue: 0,
		totalOrders: 0,
		totalExpenses: 0,
		totalToCollect: 0,
		pendingOrders: 0,
		todayOrders: 0,
		ordersToShip: 0,
		expensesThisMonth: 0,
	};

	/** Percentage change vs previous period (null if no comparison). */
	deltaRevenue: number | null = null;
	deltaOrders: number | null = null;
	deltaExpenses: number | null = null;

	/** Daily order target for gauge (green when at or above). */
	dailyOrderTarget = 30;

	recentOrders: RecentOrder[] = [];
	recentExpenses: RecentExpense[] = [];
	/** Events overlapping current month (server UTC). */
	eventsThisMonth: CalendarEventResponseDto[] = [];

	/** Revenue + Expenses trend (last 6 months). */
	revenueData = {
		labels: [] as string[],
		datasets: [
			{ label: 'Revenue', data: [] as number[], borderColor: '#059669', backgroundColor: 'rgba(5, 150, 105, 0.2)', borderWidth: 2, fill: true, tension: 0.4 },
			{ label: 'Expenses', data: [] as number[], borderColor: '#dc2626', backgroundColor: 'rgba(220, 38, 38, 0.2)', borderWidth: 2, fill: true, tension: 0.4 },
		],
	};

	revenueChartOptions: any = {
		responsive: true,
		maintainAspectRatio: true,
		plugins: {
			legend: { position: 'top', display: true },
			title: { display: false },
		},
		scales: {
			y: {
				beginAtZero: true,
				ticks: { callback: (v: unknown) => 'Nu.' + Number(v).toLocaleString() },
				grid: { display: false },
				border: { display: false },
			},
			x: { grid: { display: false }, border: { display: false } },
		},
		elements: { line: { tension: 0.4, borderWidth: 2 }, point: { radius: 2 } },
	};

	financialSummaryPeriods: FinancialSummaryPeriod[] = [];

	/** Title for financial summary card: "January 2025". */
	get summaryMonthTitle(): string {
		if (this.financialSummaryPeriods.length > 0) {
			return this.financialSummaryPeriods[0].periodLabel;
		}
		const d = this.selectedMonthDate;
		const name = this.monthOptions.find((m) => m.value === d.getMonth() + 1)?.label ?? '';
		return `${name} ${d.getFullYear()}`;
	}

	constructor(
		private orderService: OrderService,
		private expenseService: ExpenseService,
		private calendarEventService: CalendarEventService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.loadDashboard();
	}

	onMonthChange() {
		this.loadDashboard();
	}

	/** Called when p-calendar (month picker) selection changes. */
	onMonthDateChange() {
		if (this.selectedMonthDate) {
			this.byMonthYear = this.selectedMonthDate.getFullYear();
			this.byMonthMonth = this.selectedMonthDate.getMonth() + 1;
			this.loadDashboard();
		}
	}

	loadDashboard() {
		this.loading = true;
		const y = this.byMonthYear;
		const m = this.byMonthMonth;
		const prevY = m === 1 ? y - 1 : y;
		const prevM = m === 1 ? 12 : m - 1;
		forkJoin({
			orderReport: this.orderService.getOrderMonthlyReport(y, m),
			orderStats: this.orderService.getOrderStatisticsByMonth(y, m),
			ordersByMonth: this.orderService.getOrdersByMonth(y, m),
			expenseReport: this.expenseService.getMonthlyReport({ year: y, month: m }),
			expensesByMonth: this.expenseService.getByMonth({ year: y, month: m }),
			prevOrderReport: this.orderService.getOrderMonthlyReport(prevY, prevM),
			prevOrderStats: this.orderService.getOrderStatisticsByMonth(prevY, prevM),
			prevExpenseReport: this.expenseService.getMonthlyReport({ year: prevY, month: prevM }),
			eventsThisMonth: this.calendarEventService.getEventsThisMonth(),
		}).subscribe({
			next: (res) => {
				const report = res.orderReport;
				const stats = res.orderStats;
				const orders = res.ordersByMonth?.orders ?? [];
				const expReport = res.expenseReport;
				const expenses = res.expensesByMonth ?? [];
				const prevReport = res.prevOrderReport;
				const prevStats = res.prevOrderStats;
				const prevExpReport = res.prevExpenseReport;
				this.eventsThisMonth = res.eventsThisMonth ?? [];

				const totalExpenses = expReport.byTypeAndSubtype?.reduce((sum, x) => sum + (x.totalAmount ?? 0), 0) ?? 0;
				const prevRevenue = prevReport?.revenue ?? 0;
				const prevOrders = prevStats?.totalOrders ?? 0;
				const prevExpTotal = prevExpReport?.byTypeAndSubtype?.reduce((s: number, x: { totalAmount?: number }) => s + (x.totalAmount ?? 0), 0) ?? 0;
				this.deltaRevenue = prevRevenue > 0 ? Math.round(((report.revenue ?? 0) - prevRevenue) / prevRevenue * 100) : null;
				this.deltaOrders = prevOrders > 0 ? Math.round((stats.totalOrders - prevOrders) / prevOrders * 100) : null;
				this.deltaExpenses = prevExpTotal > 0 ? Math.round((totalExpenses - prevExpTotal) / prevExpTotal * 100) : null;

				const today = new Date();
				const isCurrentMonth = today.getFullYear() === y && today.getMonth() + 1 === m;
				const todayOrders = isCurrentMonth
					? orders.filter((o) => {
							const placed = o.placedAt ? new Date(o.placedAt) : null;
							return placed && placed.getDate() === today.getDate() && placed.getMonth() === today.getMonth() && placed.getFullYear() === today.getFullYear();
						}).length
					: 0;
				const ordersToShip = (stats.ordersByStatus as Record<string, number>)?.['SHIPPING'] ?? 0;

				this.stats = {
					totalRevenue: report.revenue ?? 0,
					totalOrders: stats.totalOrders ?? 0,
					totalExpenses,
					totalToCollect: report.totalToCollect ?? 0,
					pendingOrders: stats.pendingOrders ?? 0,
					todayOrders,
					ordersToShip,
					expensesThisMonth: totalExpenses,
				};

				this.recentOrders = (orders as Order[])
					.slice(0, 5)
					.map((o) => ({
						id: o.id,
						orderNumber: o.orderNumber ?? '',
						customerName: o.customer?.name ?? '—',
						itemCount: o.orderItems?.length ?? 0,
						total: o.totalPayable ?? 0,
						fulfillmentStatus: o.fulfillmentStatus ?? '',
						paymentStatus: o.paymentStatus ?? '',
						placedAt: o.placedAt ?? null,
					}));

				this.recentExpenses = (expenses as Expense[]).slice(0, 5).map((e) => ({
					description: e.description ?? '',
					amount: e.amount ?? 0,
					type: e.type ?? undefined,
					subtype: e.subtype ?? undefined,
					date: e.date ?? '',
				}));

				const capital = expReport.byTypeAndSubtype?.filter((x) => x.type === 'capital_expenditures').reduce((s, x) => s + (x.totalAmount ?? 0), 0) ?? 0;
				const recurring = expReport.byTypeAndSubtype?.filter((x) => x.type === 'recurring_operational').reduce((s, x) => s + (x.totalAmount ?? 0), 0) ?? 0;
				const hr = expReport.byTypeAndSubtype?.filter((x) => x.type === 'human_resources').reduce((s, x) => s + (x.totalAmount ?? 0), 0) ?? 0;
				const revenue = report.revenue ?? 0;
				const netProfit = revenue - totalExpenses;
				const monthName = this.monthOptions.find((mo) => mo.value === m)?.label ?? '';
				this.financialSummaryPeriods = [
					{
						periodLabel: `${monthName} ${y}`,
						periodBg: 'bg-purple-50',
						netProfitRowBg: 'bg-purple-100',
						rows: [
							{ item: 'Total Sale', value: revenue, isNetProfit: false },
							{ item: 'Total Capital Expenditure', value: capital, isNetProfit: false },
							{ item: 'Total Recurring Expenditure', value: recurring, isNetProfit: false },
							{ item: 'Total Human Resource Expenditure', value: hr, isNetProfit: false },
							{ item: 'Net profit', value: netProfit, isNetProfit: true },
						],
					},
				];
				this.loading = false;
				this.cdr.markForCheck();
				this.loadTrendChart();
			},
			error: () => {
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	/** Load last 6 months for Revenue + Expenses trend chart. */
	loadTrendChart() {
		const y = this.byMonthYear;
		const m = this.byMonthMonth;
		const months: { y: number; m: number }[] = [];
		for (let i = 5; i >= 0; i--) {
			let yy = y;
			let mm = m - i;
			while (mm < 1) {
				mm += 12;
				yy -= 1;
			}
			while (mm > 12) {
				mm -= 12;
				yy += 1;
			}
			months.push({ y: yy, m: mm });
		}
		forkJoin(
			months.map(({ y: yr, m: mo }) =>
				forkJoin({
					orderReport: this.orderService.getOrderMonthlyReport(yr, mo),
					expenseReport: this.expenseService.getMonthlyReport({ year: yr, month: mo }),
				})
			)
		).subscribe((results) => {
			const labels = months.map(({ y: yr, m: mo }) => {
				const name = this.monthOptions.find((o) => o.value === mo)?.label ?? '';
				return `${name.slice(0, 3)} ${yr}`;
			});
			const revenueData = results.map((r) => r.orderReport?.revenue ?? 0);
			const expenseData = results.map((r) => {
				const rep = r.expenseReport;
				return rep?.byTypeAndSubtype?.reduce((s: number, x: { totalAmount?: number }) => s + (x.totalAmount ?? 0), 0) ?? 0;
			});
			this.revenueData = {
				...this.revenueData,
				labels,
				datasets: [
					{ ...this.revenueData.datasets[0], data: revenueData },
					{ ...this.revenueData.datasets[1], data: expenseData },
				],
			};
			this.cdr.markForCheck();
		});
	}

	getStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
		const s = (status || '').toUpperCase();
		if (['CONFIRMED', 'PAID', 'DELIVERED', 'SHIPPING'].includes(s)) return 'success';
		if (['PLACED', 'PENDING', 'PARTIAL', 'PROCESSING'].includes(s)) return 'warning';
		if (['CANCELED', 'CANCELLED', 'FAILED'].includes(s)) return 'danger';
		return 'info';
	}

	/** Dot color for status (reduces visual noise vs full tag). */
	getStatusDotClass(status: string): string {
		const sev = this.getStatusSeverity(status);
		if (sev === 'success') return 'bg-green-500';
		if (sev === 'warning') return 'bg-amber-500';
		if (sev === 'danger') return 'bg-red-500';
		return 'bg-gray-400';
	}

	/** Format delta for display: +12% or -5%. */
	formatDelta(pct: number | null): string {
		if (pct == null) return '';
		const sign = pct >= 0 ? '+' : '';
		return `${sign}${pct}%`;
	}

	/** Green for growth (revenue/orders), red for decline. For expenses: green when down, red when up. */
	deltaClass(pct: number | null, forExpenses = false): string {
		if (pct == null) return '';
		const good = forExpenses ? pct <= 0 : pct >= 0;
		return good ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
	}

	formatDate(d: Date | string | null | undefined): string {
		if (d == null) return '—';
		const date = typeof d === 'string' ? new Date(d) : d;
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	/** Format event start/end for display (all-day vs timed). */
	formatEventDate(start: Date | string | undefined, end: Date | string | null | undefined, allDay?: boolean): string {
		if (start == null) return '—';
		const s = typeof start === 'string' ? new Date(start) : start;
		if (allDay) {
			const e = end != null ? (typeof end === 'string' ? new Date(end) : end) : null;
			if (e && (e.getTime() !== s.getTime())) {
				return s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' – ' + e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			}
			return s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		}
		return s.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	}

	formatCurrency(amount: number): string {
		return `Nu. ${amount.toLocaleString()}`;
	}

	/** For financial summary: 2 decimals, handles negatives e.g. -Nu. 42,004.00 */
	formatFinancialValue(value: number): string {
		const n = Math.abs(value);
		const s = n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
		return value < 0 ? `-Nu. ${s}` : `Nu. ${s}`;
	}

	expenseSubtypeLabel(type: string | undefined, subtype: string | undefined): string {
		return getExpenseSubtypeLabel(type, subtype) || '—';
	}
}
