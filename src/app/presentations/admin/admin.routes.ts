import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { CreateProductComponent } from './product-management/components/create-product/create-product.component';
import { UpdateProductComponent } from './product-management/components/update-product/update-product.component';
import { AdminListCategoriesComponent } from './product-management/admin-list-categories/admin-list-categories.component';
import { AdminListOrdersComponent } from './order-management/admin-list-orders/admin-list-orders.component';
import { AdminListCustomersComponent } from './order-management/admin-list-customers/admin-list-customers.component';
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
import { AdminCalendarComponent } from './calendar/admin-calendar.component';
import { AdminTodoManagementComponent } from './todo-management/admin-todo-management.component';
import { AdminListDocumentsComponent } from './documents-archive/admin-list-documents/admin-list-documents.component';
import { DeliveryLocationsWithRatesComponent } from './settings/delivery/delivery-locations-with-rates/delivery-locations-with-rates.component';
import { AdminGuard } from '../../core/guards/auth.guard';
import { AdminListAdministratorComponent } from './admin-management/admin-list-administrator/admin-list-administrator.component';
import { AdminListStaffsComponent } from './hr-management/admin-list-staffs/admin-list-staffs.component';

export const adminRoutes: Routes = [
	{
		path: 'admin',
		component: LayoutComponent,
		canActivate: [AdminGuard],
		children: [
			{
				path: '',
				component: AdminDashboardComponent,
			},
			{
				path: 'admins',
				component: AdminListAdministratorComponent,
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
			{
				path: 'staffs',
				component: AdminListStaffsComponent,
			},
			
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
			
			//HR MANAGEMENT ROUTES
			{
				path:'staffs',
				component: AdminListStaffsComponent,
			},
		

			// Settings Routes
			{
				path: 'settings/delivery',
				component: DeliveryLocationsWithRatesComponent,
			},
			// Document Archive Route
			{
				path: 'documents-archive',
				component: AdminListDocumentsComponent,
			},
		],
	},
];
