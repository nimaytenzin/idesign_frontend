import { Routes } from '@angular/router';
import { PublicHomeComponent } from './public-home/public-home.component';
import { PublicLayoutComponentComponent } from './layout/public-layout-component/public-layout-component.component';
import { PublicProductCatalogComponent } from './public-product-catalog/public-product-catalog.component';

export const publicRoutes: Routes = [
	{
		path: '',
		component: PublicLayoutComponentComponent,
		children: [
			{ path: '', component: PublicHomeComponent },
			{ path: 'products', component: PublicProductCatalogComponent },
			{ path: 'catalog', redirectTo: 'products', pathMatch: 'full' },
		],
	},
];
