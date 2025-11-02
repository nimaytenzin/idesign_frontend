import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
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
		],
	},
];
