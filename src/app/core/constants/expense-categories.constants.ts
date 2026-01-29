/**
 * Expense categories: type and subtype options for expense forms.
 * Types: recurring_operational, capital_expenditures, human_resources.
 * Subtypes depend on the selected type.
 */

/** Raw structure: type -> subtype key -> array of example labels (for reference) */
export const EXPENSE_CATEGORIES = {
	recurring_operational: {
		raw_materials_consumables: [
			'Filament (PLA, ASA, Generic)',
			'Packaging (Boxes, Bags, Sealer Rolls)',
			'Finishing Supplies (Paints, Glue, Thinner)',
			'Office Supplies (Paper, Brochures, Stationery)',
		],
		equipment_maintenance_repair: [
			'Printer Parts Replacement',
			'Tools and Workshop Supplies',
			'Service and Repair Charges',
		],
		facility_utilities: [
			'Rent',
			'Security Deposit',
			'Utilities (Electricity, Wi-Fi)',
			'Cleaning and Maintenance',
		],
		logistics_shipping: [
			'Freight and Shipping Costs',
			'Local Transport (Taxi, Bus)',
			'Travel and Accommodation',
		],
		marketing_business_development: [
			'Software Subscriptions (Canva)',
			'Marketing Collateral',
			'Promotional Items',
		],
		professional_administrative: [
			'Fees and Taxes',
			'Bank Charges',
			'Communication Costs',
		],
		subcontractor_commission_fees: [
			'Sales Commissions',
			'Contractor/Labor Charges',
			'Contributions and Donations',
		],
	},
	capital_expenditures: {
		'3d_printing_production_equipment': [
			'3D Printers (Creality, Ender)',
			'Printer Upgrades and Parts',
		],
		workshop_tools_machinery: [
			'Power Tools',
			'Hand Tools',
			'Safety Equipment',
		],
		office_furniture_setup: [
			'Furniture (Chairs, Tables)',
			'Office Setup and Fixtures',
		],
		facility_improvement: [
			'Construction Materials',
			'Electrical and Plumbing',
			'Renovation and Build-out',
		],
		technology_software: [
			'Computer Hardware',
			'Signage and Display',
			'Electronic Equipment',
		],
	},
	human_resources: {
		salaries_wages: [
			'Basic Salary',
			'Bonuses and Incentives',
		],
		commissions: [
			'Sales Commissions',
			'Dealer Fees',
		],
		contract_labor: [
			'Welding Charges',
			'Specialized Labor',
			'Intern Remuneration',
		],
	},
} as const;


export type ExpenseTypeKey = keyof typeof EXPENSE_CATEGORIES;

/** Converts snake_case to Title Case (e.g. "raw_materials_consumables" -> "Raw Materials Consumables") */
function humanize(key: string): string {
	return key
		.split(/_+/)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
		.join(' ');
}

/** Options for the Type dropdown: { value, label } */
export const EXPENSE_TYPES: { value: string; label: string }[] = (
	Object.keys(EXPENSE_CATEGORIES) as ExpenseTypeKey[]
).map((k) => ({
	value: k,
	label: humanize(k),
}));

/**
 * Returns subtype options for the given type. Use for the Subtype dropdown.
 * When type is empty or unknown, returns [].
 */
export function getExpenseSubtypes(type: string | null | undefined): { value: string; label: string }[] {
	if (!type || !(type in EXPENSE_CATEGORIES)) return [];
	const sub = (EXPENSE_CATEGORIES as Record<string, Record<string, unknown>>)[type];
	if (!sub || typeof sub !== 'object') return [];
	return Object.keys(sub).map((k) => ({
		value: k,
		label: humanize(k),
	}));
}

/** Returns display label for a type value, or the raw value if unknown. */
export function getExpenseTypeLabel(type: string | null | undefined): string {
	if (!type) return '';
	const o = EXPENSE_TYPES.find((t) => t.value === type);
	return o?.label ?? type;
}

/** Returns display label for a subtype value given its type, or the raw value if unknown. */
export function getExpenseSubtypeLabel(type: string | null | undefined, subtype: string | null | undefined): string {
	if (!subtype) return '';
	const opts = getExpenseSubtypes(type);
	const o = opts.find((s) => s.value === subtype);
	return o?.label ?? subtype;
}
