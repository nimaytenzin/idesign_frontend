export enum USERROLESENUM {
	'ADMIN' = 'ADMIN',
	'STAFF' = 'STAFF',
}
// Admin Sidebar Menu - Full system access
export const ADMINSIDEBARITEMS = [
	{
		label: 'Overview',
		items: [
			{
				label: 'Dashboard',
				icon: 'pi pi-fw pi-chart-bar',
				routerLink: ['/admin'],
				roles: [USERROLESENUM.ADMIN, USERROLESENUM.STAFF],
			},

			{
				label: 'Company Profile	',
				icon: 'pi pi-fw pi-building',
				routerLink: ['/admin/company-profile'],
				roles: [USERROLESENUM.ADMIN],
			},
			{
				label: 'Services & Clients',
				icon: 'pi pi-fw pi-users',
				routerLink: ['/admin/company-clients'],
				roles: [USERROLESENUM.ADMIN],
			},
			{
				label: 'Advertisements',
				icon: 'pi pi-fw pi-images',
				routerLink: ['/admin/advertisements'],
				roles: [USERROLESENUM.ADMIN],
			},
		],
	},
		{
			label: 'Task Management',
			items: [
			{
				label: 'Todo Management',
				icon: 'pi pi-fw pi-list',
				routerLink: ['/admin/todos'],
				roles: [USERROLESENUM.ADMIN],
			},
			{
				label: 'Calendar & Events',
				icon: 'pi pi-fw pi-calendar',
				routerLink: ['/admin/calendar'],
				roles: [USERROLESENUM.ADMIN, USERROLESENUM.STAFF],
			},
		],
	},
	{
		label: 'Product Management',
		items: [
			{
				label: 'Categories',
				icon: 'pi pi-fw pi-tags',
				routerLink: ['/admin/categories'],
				roles: [USERROLESENUM.ADMIN],
			},
			{
				label: 'Products',
				icon: 'pi pi-fw pi-box',
				routerLink: ['/admin/products'],
				roles: [USERROLESENUM.ADMIN],
			},
			{
				label: 'Discounts',
				icon: 'pi pi-fw pi-money-bill',
				routerLink: ['/admin/discounts'],
				roles: [USERROLESENUM.ADMIN],
			},
		],
	},
	{
		label: 'Orders & Sales',
		items: [
			{
				label: 'Orders',
				icon: 'pi pi-fw pi-shopping-cart',
				routerLink: ['/admin/orders'],
				roles: [USERROLESENUM.ADMIN, USERROLESENUM.STAFF],
			},
			{
				label: 'SMS Templates',
				icon: 'pi pi-fw pi-send',
				routerLink: ['/admin/orders/sms-templates'],
				roles: [USERROLESENUM.ADMIN],
			},
			{
				label: 'Customers',
				icon: 'pi pi-fw pi-users',
				routerLink: ['/admin/customers'],
				roles: [USERROLESENUM.ADMIN, USERROLESENUM.STAFF],
			},
			{
				label: 'Analytics',
				icon: 'pi pi-fw pi-chart-line',
				routerLink: ['/admin/analytics'],
				roles: [USERROLESENUM.ADMIN],
			},
		],
	},
	{
		label: 'Accounts',
		items: [
			{
				label: 'Charts of Accouts',
				icon: 'pi pi-fw pi-list',
				routerLink: ['/admin/chart-of-accounts'],
				roles: [USERROLESENUM.ADMIN],
			},
			{
				label: 'General Ledger',
				icon: 'pi pi-fw pi-book',
				routerLink: ['/admin/general-ledger'],
				roles: [USERROLESENUM.ADMIN],
			},

			{
				label: 'Profit & Loss',
				icon: 'pi pi-fw pi-money-bill',
				routerLink: ['/admin/profit-loss'],
				roles: [USERROLESENUM.ADMIN],
			},
			{
				label: 'Expense Recording',
				icon: 'pi pi-fw pi-file-pdf',
				routerLink: ['/admin/expense-recording'],
				roles: [USERROLESENUM.ADMIN, USERROLESENUM.STAFF],
			},
		],
	},
	{
		label: 'HR Management',
		items: [
			{
				label: 'Employees',
				icon: 'pi pi-fw pi-user',
				routerLink: ['/admin/employees'],
				roles: [USERROLESENUM.ADMIN],
			},
			{
				label: 'Affiliate Marketers',
				icon: 'pi pi-fw pi-user',
				routerLink: ['/admin/affiliate-marketers'],
				roles: [USERROLESENUM.ADMIN],
			},
			{
				label: 'Leave Types',
				icon: 'pi pi-fw pi-calendar-times',
				routerLink: ['/admin/hr/leave-types'],
				roles: [USERROLESENUM.ADMIN],
			},
			{
				label: 'Leave Requests',
				icon: 'pi pi-fw pi-calendar-times',
				routerLink: ['/admin/hr/leave-requests'],
				roles: [USERROLESENUM.ADMIN, USERROLESENUM.STAFF],
			},
		],
	},
	{
		label: 'Content Management',
		items: [],
	},
	{
		label: 'Settings',
		items: [
			{
				label: 'General Settings',
				icon: 'pi pi-fw pi-cog',
				routerLink: ['/admin/settings'],
				roles: [USERROLESENUM.ADMIN],
			},
			{
				label: 'System Logs',
				icon: 'pi pi-fw pi-file-text',
				routerLink: ['/admin/logs'],
				roles: [USERROLESENUM.ADMIN],
			},
		],
	},
];
