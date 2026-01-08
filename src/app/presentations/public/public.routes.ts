import { Routes } from '@angular/router';
import { PublicHomeComponent } from './public-home/public-home.component';
import { PublicLayoutComponentComponent } from './layout/public-layout-component/public-layout-component.component';
import { PublicProductCatalogComponent } from './public-product-catalog/public-product-catalog.component';
import { PublicCheckoutComponent } from './public-checkout/public-checkout.component';
import { PublicOrderConfirmationComponent } from './public-order-confirmation/public-order-confirmation.component';
import { PublicOrderPaymentComponent } from './public-order-payment/public-order-payment.component';
import { PublicOrderTrackingComponent } from './public-order-tracking/public-order-tracking.component';

export const publicRoutes: Routes = [
	{
		path: '',
		component: PublicLayoutComponentComponent,
		children: [
			{ path: '', component: PublicHomeComponent },
			{ path: 'products', component: PublicProductCatalogComponent },
			{ path: 'catalog', redirectTo: 'products', pathMatch: 'full' },
			{ path: 'checkout', component: PublicCheckoutComponent },
			{ path: 'order-confirmation', component: PublicOrderConfirmationComponent },
			{ path: 'order-payment', component: PublicOrderPaymentComponent },
			{ path: 'track-order', component: PublicOrderTrackingComponent },
			{ path: 'track', redirectTo: 'track-order', pathMatch: 'full' },
		],
	},
];
