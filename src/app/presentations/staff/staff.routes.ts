import { Routes } from '@angular/router';
import { LayoutComponent } from '../../layout/layout.component';
import { StaffDashboardComponent } from './staff-dashboard/staff-dashboard.component';
import { StaffGuard } from '../../core/guards/auth.guard';
  
export const staffRoutes: Routes = [
	{
		path: 'staff',
		component: LayoutComponent,
		canActivate: [StaffGuard],
		children: [
			{
				path: '',
				component: StaffDashboardComponent,
			},
			 
		],
	},
];
