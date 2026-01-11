import { Routes } from '@angular/router';
import { LayoutComponent } from '../../layout/layout.component';
import { StaffDashboardComponent } from './staff-dashboard/staff-dashboard.component';
import { StaffGuard } from '../../core/guards/auth.guard';
import { StaffOrderManagementComponent } from './staff-order-management/staff-order-management.component';
import { StaffDocumentArchiveComponent } from './staff-document-archive/staff-document-archive.component';
import { StaffProfileComponent } from './staff-profile/staff-profile.component';
import { StaffToDoComponent } from './staff-to-do/staff-to-do.component';
import { AdminListOrdersComponent } from '../admin/order-management/admin-list-orders/admin-list-orders.component';
  
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

			{
				path: 'manage-orders',
				component:AdminListOrdersComponent,
			},
			{
				path:'view-documents',
				component:StaffDocumentArchiveComponent
			},
			{
				path:'profile',
				component:StaffProfileComponent
			},
			{
				path:'todos',
				component:StaffToDoComponent
			}

			 
		],
	},
];
