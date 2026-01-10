import { Routes } from '@angular/router';
import { AffiliateDashboardComponent } from './affiliate-dashboard/affiliate-dashboard.component';
import { LayoutComponent } from '../../layout/layout.component';
    
export const affiliateMarketerRoutes: Routes = [
	{
		path: 'affiliate-marketer',
		component: LayoutComponent,
		children: [
			{
				path: '',
				component: AffiliateDashboardComponent,
			},
			 
		],
	},
];
