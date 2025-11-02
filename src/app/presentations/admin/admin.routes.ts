import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { AdminMasterCategoryComponent } from './product-management/admin-master-category/admin-master-category.component';
import { AdminMasterProductsComponent } from './product-management/admin-master-products/admin-master-products.component';
import { LayoutComponent } from '../../layout/layout.component';

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
				component: AdminMasterCategoryComponent,
			},
			{
				path: 'products',
				component: AdminMasterProductsComponent,
			},
		],
	},
];
