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
		label: 'Sales & Expenses',
		items: [
			{
				label: 'Orders',
				icon: 'pi pi-fw pi-shopping-cart',
				routerLink: ['/admin/orders'],
				roles: [USERROLESENUM.ADMIN, USERROLESENUM.STAFF],
			},

			{
				label: 'Expense',
				icon: 'pi pi-fw pi-wallet',
				routerLink: ['/admin/expenses'],
				roles: [USERROLESENUM.ADMIN, USERROLESENUM.STAFF],
			},
			
		
			{
				label: 'Customers',
				icon: 'pi pi-fw pi-users',
				routerLink: ['/admin/customers'],
				roles: [USERROLESENUM.ADMIN, USERROLESENUM.STAFF],
			},
			
		],
	},
	{
		label: 'HR Management',
		items: [
			{
				label: 'Staffs',
				icon: 'pi pi-fw pi-user',
				routerLink: ['/admin/staffs'],
				roles: [USERROLESENUM.ADMIN],
			},
			{
				label: 'Staff Attendance',
				icon: 'pi pi-fw pi-calendar-check',
				routerLink: ['/admin/staff-attendance'],
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
		label: 'Affiliate Marketers',
		items: [
			{
				label: 'List Affiliate Marketers',
				icon: 'pi pi-fw pi-user',
				routerLink: ['/admin/affiliate-marketers'],
				roles: [USERROLESENUM.ADMIN],
			},
			
		 
		],
	},
	{
		label: 'Content Management',
		items: [
			{
				label: 'Company Profile	',
				icon: 'pi pi-fw pi-building',
				routerLink: ['/admin/company-profile'],
				roles: [USERROLESENUM.ADMIN],
			},
			{
				label: 'Document Archive',
				icon: 'pi pi-fw pi-folder',
				routerLink: ['/admin/documents-archive'],
				roles: [USERROLESENUM.ADMIN, USERROLESENUM.STAFF],
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
		label: 'Settings',
		items: [
			{
				label: 'View Analytics',
				icon: 'pi pi-fw pi-chart-line',
				routerLink: ['/admin/analytics'],
				roles: [USERROLESENUM.ADMIN],
			},

		
			{
				label: 'Administrators',
				icon: 'pi pi-fw pi-user',
				routerLink: ['/admin/admins'],
				roles: [USERROLESENUM.ADMIN],
			},
			{
				label: 'General Settings',
				icon: 'pi pi-fw pi-cog',
				routerLink: ['/admin/settings'],
				roles: [USERROLESENUM.ADMIN],
			},
			{
				label: 'Delivery Locations & Rates',
				icon: 'pi pi-fw pi-map-marker',
				routerLink: ['/admin/settings/delivery'],
				roles: [USERROLESENUM.ADMIN],
			},
			{
				label: 'Bank Accounts',
				icon: 'pi pi-fw pi-wallet',
				routerLink: ['/admin/settings/bank-accounts'],
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


export const STAFFSIDEBARITEMS = [
	{
		label: 'Overview',
		items: [
			{
				label: 'Dashboard',
				icon: 'pi pi-fw pi-chart-bar',
				routerLink: ['/staff'],
			},
			{
				label: 'Manage Orders',
				icon: 'pi pi-fw pi-shopping-cart',
				routerLink: ['/staff/manage-orders'],
			},
			{
				label: 'Record Expenses',
				icon: 'pi pi-fw pi-money-bill',
				routerLink: ['/staff/record-expenses'],
			},
			{
				label: 'Document Archive',
				icon: 'pi pi-fw pi-file-pdf',
					routerLink: ['/staff/view-documents'],
 			},
			{
				label: 'Profile',
				icon: 'pi pi-fw pi-user',
				routerLink: ['/staff/profile'],
			},
		],
	},
];