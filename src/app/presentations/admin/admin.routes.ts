import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { CreateProductComponent } from './product-management/components/create-product/create-product.component';
import { UpdateProductComponent } from './product-management/components/update-product/update-product.component';
import { AdminListCategoriesComponent } from './product-management/admin-list-categories/admin-list-categories.component';
import { AdminMasterOrdersComponent } from './order-management/admin-master-orders/admin-master-orders.component';
import { AdminListOrdersComponent } from './order-management/admin-list-orders/admin-list-orders.component';
import { AdminPlaceOrderComponent } from './order-management/admin-place-order/admin-place-order.component';
import { AdminListCustomersComponent } from './order-management/admin-list-customers/admin-list-customers.component';
import { AdminEditOrderRouteComponent } from './order-management/admin-edit-order-route/admin-edit-order-route.component';
import { AdminGeneralLedgerComponent } from './accounts/admin-general-ledger/admin-general-ledger.component';
import { AdminProfitLossComponent } from './accounts/admin-profit-loss/admin-profit-loss.component';
import { AdminExpenseRecordingComponent } from './accounts/admin-expense-recording/admin-expense-recording.component';
import { AdminChartOfAccountsComponent } from './accounts/admin-chart-of-accounts/admin-chart-of-accounts.component';
import { AdminHeroSlideListComponent } from './hero-slide-management/admin-hero-slide-list/admin-hero-slide-list.component';
import { LayoutComponent } from '../../layout/layout.component';
import { CompanyProfileComponent } from './company/company-profile/company-profile.component';
import { AdminCompanyClientListComponent } from './company/company-clients/admin-company-client-list/admin-company-client-list.component';
import { AdminAnalyticsComponent } from './analytics/admin-analytics.component';
import { AdminSmsTemplateListComponent } from './sms-template-management/admin-sms-template-list/admin-sms-template-list.component';
import { AdminListProductsComponent } from './product-management/admin-list-products/admin-list-products.component';
import { AdminDiscountListComponent } from './discount-management/admin-discount-list/admin-discount-list.component';
import { AdminListEmployeesComponent } from './employee-management/admin-list-employees/admin-list-employees.component';
import { AdminCalendarComponent } from './calendar/admin-calendar.component';
import { AdminTodoManagementComponent } from './todo-management/admin-todo-management.component';
import { AdminListAffiliateMarketersComponent } from './affiliate-marketer-management/admin-list-affiliate-marketers/admin-list-affiliate-marketers.component';

export const adminRoutes: Routes = [
	{
		path: 'admin',
		component: LayoutComponent,
		children: [
			{
				path: '',
				component: AdminDashboardComponent,
			},
			{
				path: 'categories',
				component: AdminListCategoriesComponent,
			},
			{
				path: 'products',
				component: AdminListProductsComponent,
			},
			{
				path: 'products/new',
				component: CreateProductComponent,
			},
			{
				path: 'products/edit/:id',
				component: UpdateProductComponent,
			},
			// Order Management Routes
			{
				path: 'customers',
				component: AdminListCustomersComponent,
			},
			{
				path: 'orders',
				component: AdminListOrdersComponent,
			},
			
			{
				path: 'orders/sms-templates',
				component: AdminSmsTemplateListComponent,
			},
			// Accounts Routes
			{
				path: 'chart-of-accounts',
				component: AdminChartOfAccountsComponent,
			},
			{
				path: 'general-ledger',
				component: AdminGeneralLedgerComponent,
			},
			{
				path: 'profit-loss',
				component: AdminProfitLossComponent,
			},
			{
				path: 'expense-recording',
				component: AdminExpenseRecordingComponent,
			},
			// Company Profile Route
			{
				path: 'company-profile',
				component: CompanyProfileComponent,
			},
			// Company Client Management Route
			{
				path: 'company-clients',
				component: AdminCompanyClientListComponent,
			},
			// Hero Slide Management Route
			{
				path: 'hero-slides',
				component: AdminHeroSlideListComponent,
			},
			// HR Management Routes
			
			// Analytics Route
			{
				path: 'analytics',
				component: AdminAnalyticsComponent,
			},
			// Discount Management Route
			{
				path: 'discounts',
				component: AdminDiscountListComponent,
			},
			// Employee Management Route
			{
				path: 'employees',
				component: AdminListEmployeesComponent,
			},
			// Calendar Route
			{
				path: 'calendar',
				component: AdminCalendarComponent,
			},
			// Todo Management Route
			{
				path: 'todos',
				component: AdminTodoManagementComponent,
			},
			// Affiliate Marketer Management Route
			{
				path: 'affiliate-marketers',
				component: AdminListAffiliateMarketersComponent,
			},
		],
	},
];
