import { Component, OnInit, ChangeDetectorRef, ViewChild, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TieredMenu } from 'primeng/tieredmenu';
import { Product } from '../../../../core/dataservice/product/product.interface';
import { ProductService } from '../../../../core/dataservice/product/product.service';
import { ProductCategoryService } from '../../../../core/dataservice/product-category/product-category.service';
import { ProductSubCategoryService } from '../../../../core/dataservice/product-sub-category/product-sub-category.service';
import { ProductCategory, ProductSubCategory } from '../../../../core/dataservice/product-category/product-category.interface';
import { PrimeNgModules } from '../../../../primeng.modules';
import { Discount, DiscountValueType, DiscountProduct } from '../../../../core/dataservice/discount/discount.interface';
import { environment } from '../../../../../environments/environment';
import { Table } from 'primeng/table';
import { AdminProductFormComponent } from '../admin-product-form/admin-product-form.component';

@Component({
	selector: 'app-admin-list-products',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule, PrimeNgModules],
	providers: [ConfirmationService, MessageService, DialogService],
	templateUrl: './admin-list-products.component.html',
	styleUrls: ['./admin-list-products.component.scss'],
})
export class AdminListProductsComponent implements OnInit, AfterViewInit {
	@ViewChild('productTable') productTable!: Table;
	@ViewChildren('actionMenu') actionMenuList!: QueryList<TieredMenu>;

	// Data
	public products: Product[] = [];
	public categories: ProductCategory[] = [];
	public subCategories: ProductSubCategory[] = [];
	public selectedProducts: Product[] = [];

	// Filters
	public globalFilter: string = '';
	public categoryFilter: number | null = null;
	public materialFilter: string | null = null;

	// Pagination
	public first: number = 0;
	public rows: number = 7;
	public totalRecords: number = 0;

	// Selection
	public selected: number[] = [];
	public selectedMap: { [key: number]: boolean } = {};
	public allSelected: boolean = false;

	// Action menu references
	public actionMenus: Map<number, TieredMenu> = new Map();

	// UI State
	public loading: boolean = false;
	public deleteDialog: boolean = false;
	public productToDelete: Product | null = null;
	public dialogRef?: DynamicDialogRef;

	// Material Options
	public materialOptions = [
		{ label: 'PLA', value: 'PLA' },
		{ label: 'ABS', value: 'ABS' },
		{ label: 'PETG', value: 'PETG' },
		{ label: 'TPU', value: 'TPU' },
		{ label: 'Wood', value: 'Wood' },
		{ label: 'Metal', value: 'Metal' },
		{ label: 'Resin', value: 'Resin' },
	];

	constructor(
		private productService: ProductService,
		private categoryService: ProductCategoryService,
		private subCategoryService: ProductSubCategoryService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private dialogService: DialogService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.loadProducts();
		this.loadCategories();
	}

	ngAfterViewInit(): void {
		// Capture menu references when view is initialized or changes
		this.actionMenuList.changes.subscribe(() => {
			this.updateMenuReferences();
		});
		// Initial update
		setTimeout(() => this.updateMenuReferences(), 0);
	}

	private updateMenuReferences(): void {
		if (this.actionMenuList && this.actionMenuList.length > 0) {
			const products = this.getFilteredProducts();
			this.actionMenuList.forEach((menu: TieredMenu, index) => {
				if (products[index]) {
					this.actionMenus.set(products[index].id, menu);
				}
			});
		}
	}

	public loadProducts(): void {
		this.loading = true;
		this.productService.getAllProductsAdmin().subscribe({
			next: (data) => {
				this.products = data;
				this.totalRecords = data.length;
				this.loading = false;
				this.updateSelectedProducts();
				this.cdr.markForCheck();
			},
			error: (error) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load products',
				});
				this.loading = false;
				this.cdr.markForCheck();
			},
		});
	}

	public loadCategories(): void {
		this.categoryService.getCategories().subscribe({
			next: (data) => {
				this.categories = data;
				this.loadSubCategories();
			},
			error: () => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to load categories',
				});
			},
		});
	}

	public loadSubCategories(): void {
		this.subCategoryService.getSubCategories().subscribe({
			next: (data) => {
				this.subCategories = data;
				this.cdr.markForCheck();
			},
		});
	}

	public getFilteredProducts(): Product[] {
		return this.products;
	}

	public onPageChange(event: any): void {
		this.first = event.first;
		this.rows = event.rows;
		this.totalRecords = this.products.length;
	}

	public startItem(): number {
		return this.products.length === 0 ? 0 : this.first + 1;
	}

	public endItem(): number {
		return Math.min(this.first + this.rows, this.totalRecords);
	}

	public formatCurrency(value: number): string {
		return `Nu. ${new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value || 0)}`;
	}

	public getCategoryName(product: Product): string {
		return product.productSubCategory?.name || 'N/A';
	}

	// Discount helper methods
	public hasDiscount(product: Product): boolean {
		const activeDiscounts = this.getActiveDiscounts(product);
		return activeDiscounts.length > 0;
	}

	public getDiscountInfo(product: Product) {
		const activeDiscounts = this.getActiveDiscounts(product);
		
		if (activeDiscounts.length === 0) {
			return {
				originalPrice: product.price,
				discountedPrice: product.price,
				discountAmount: 0,
				discountPercentage: 0,
				bestDiscount: null,
			};
		}

		// Get the best discount (highest discount amount)
		let bestDiscount: Discount | null = null;
		let maxDiscountAmount = 0;

		for (const discount of activeDiscounts) {
			const discountAmount = this.calculateDiscountAmount(product.price, discount);
			if (discountAmount > maxDiscountAmount) {
				maxDiscountAmount = discountAmount;
				bestDiscount = discount;
			}
		}

		const discountedPrice = Math.max(0, product.price - maxDiscountAmount);
		const discountPercentage = bestDiscount
			? bestDiscount.valueType === DiscountValueType.PERCENTAGE
				? bestDiscount.discountValue
				: (maxDiscountAmount / product.price) * 100
			: 0;

		return {
			originalPrice: product.price,
			discountedPrice: discountedPrice,
			discountAmount: maxDiscountAmount,
			discountPercentage: Math.round(discountPercentage),
			bestDiscount: bestDiscount,
		};
	}

	public getDiscountCount(product: Product): number {
		return this.getActiveDiscounts(product).length;
	}

	/**
	 * Get formatted list of discounts for a product
	 */
	public getDiscountsList(product: Product): string {
		const activeDiscounts = this.getActiveDiscounts(product);
		if (activeDiscounts.length === 0) {
			return '—';
		}

		return activeDiscounts.map(discount => {
			if (discount.valueType === DiscountValueType.PERCENTAGE) {
				return `${discount.name} (${discount.discountValue}%)`;
			} else {
				return `${discount.name} (Nu. ${discount.discountValue})`;
			}
		}).join(', ');
	}

	/**
	 * Get discount badges for display
	 */
	public getDiscountBadges(product: Product): Discount[] {
		return this.getActiveDiscounts(product);
	}

	private getActiveDiscounts(product: Product): Discount[] {
		if (!product.discountProducts || product.discountProducts.length === 0) {
			return [];
		}

		const now = new Date();
		return product.discountProducts
			.map((dp: DiscountProduct) => dp.discount)
			.filter((discount: Discount | undefined): discount is Discount => {
				if (!discount) return false;
				if (!discount.isActive) return false;
				
				const startDate = new Date(discount.startDate);
				const endDate = new Date(discount.endDate);
				
				return now >= startDate && now <= endDate;
			});
	}

	private calculateDiscountAmount(price: number, discount: Discount): number {
		if (discount.valueType === DiscountValueType.PERCENTAGE) {
			return (price * discount.discountValue) / 100;
		} else {
			// FIXED_AMOUNT
			return Math.min(discount.discountValue, price);
		}
	}

	public getPrimaryImage(product: Product): string {
		const primaryImage = product.images?.find((img) => img.isPrimary);
		const imagePath = primaryImage?.imagePath || product.images?.[0]?.imagePath;

		if (!imagePath) {
			return '/assets/images/placeholder.png';
		}

		if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
			return imagePath;
		}

		return `${environment.BASEAPI_URL}${imagePath}`;
	}

	public formatDate(date: Date | string): string {
		if (!date) return 'N/A';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	public openNew(): void {
		this.dialogRef = this.dialogService.open(AdminProductFormComponent, {
			header: 'Create New Product',
			width: '90%',
			style: { 'max-width': '1200px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {},
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadProducts();
			}
		});
	}

	public editProduct(product: Product): void {
		this.dialogRef = this.dialogService.open(AdminProductFormComponent, {
			header: 'Edit Product',
			width: '90%',
			style: { 'max-width': '1200px' },
			contentStyle: { overflow: 'auto', 'max-height': '90vh' },
			baseZIndex: 10000,
			modal: true,
			dismissableMask: true,
			data: {
				product: product,
			},
		});

		this.dialogRef.onClose.subscribe((result) => {
			if (result) {
				this.loadProducts();
			}
		});
	}

	public deleteProduct(product: Product): void {
		this.productToDelete = product;
		this.deleteDialog = true;
	}

	public confirmDelete(): void {
		if (this.productToDelete) {
			this.loading = true;
			this.productService.deleteProduct(this.productToDelete.id).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Product deleted successfully',
					});
					this.loadProducts();
					this.deleteDialog = false;
					this.productToDelete = null;
				},
				error: () => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to delete product',
					});
					this.loading = false;
					this.cdr.markForCheck();
				},
			});
		}
	}

	public duplicateProduct(product: Product): void {
		this.confirmationService.confirm({
			message: `Do you want to create a copy of "${product.title}"?`,
			header: 'Duplicate Product',
			icon: 'pi pi-copy',
			accept: () => {
				this.dialogRef = this.dialogService.open(AdminProductFormComponent, {
					header: 'Duplicate Product',
					width: '90%',
					style: { 'max-width': '1200px' },
					contentStyle: { overflow: 'auto', 'max-height': '90vh' },
					baseZIndex: 10000,
					modal: true,
					dismissableMask: true,
					data: {
						duplicateProductId: product.id,
					},
				});

				this.dialogRef.onClose.subscribe((result) => {
					if (result) {
						this.loadProducts();
					}
				});
			},
		});
	}

	public toggleSelect(id: number): void {
		if (this.selected.includes(id)) {
			this.selected = this.selected.filter((i) => i !== id);
			this.selectedMap[id] = false;
		} else {
			this.selected.push(id);
			this.selectedMap[id] = true;
		}
		this.allSelected = this.isAllSelected();
		this.updateSelectedProducts();
	}

	public toggleAll(): void {
		const currentProducts = this.getFilteredProducts();
		const ids = currentProducts.map((p) => p.id);
		if (this.allSelected) {
			this.selected = this.selected.filter((id) => !ids.includes(id));
			ids.forEach((id) => {
				this.selectedMap[id] = false;
			});
			this.allSelected = false;
		} else {
			this.selected = [...new Set([...this.selected, ...ids])];
			ids.forEach((id) => {
				this.selectedMap[id] = true;
			});
			this.allSelected = true;
		}
		this.updateSelectedProducts();
	}

	public isAllSelected(): boolean {
		const currentProducts = this.getFilteredProducts();
		const ids = currentProducts.map((p) => p.id);
		return ids.length > 0 && ids.every((id) => this.selected.includes(id));
	}

	public isSelected(id: number): boolean {
		return this.selected.includes(id);
	}

	public updateSelectedProducts(): void {
		this.selectedProducts = this.products.filter((p) => this.selected.includes(p.id));
	}

	public setActionMenu(productId: number, menu: TieredMenu): void {
		this.actionMenus.set(productId, menu);
	}

	public toggleActionMenu(event: Event, productId: number): void {
		event.stopPropagation();
		const menuRef = this.actionMenus.get(productId);
		if (menuRef) {
			menuRef.toggle(event);
		} else {
			const menuIndex = this.getFilteredProducts().findIndex(p => p.id === productId);
			if (menuIndex >= 0 && this.actionMenuList && this.actionMenuList.length > menuIndex) {
				const foundMenu = this.actionMenuList.toArray()[menuIndex];
				if (foundMenu) {
					this.actionMenus.set(productId, foundMenu);
					foundMenu.toggle(event);
				}
			}
		}
	}

	public exportProducts(): void {
		const csvContent = this.convertToCSV(this.products);
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		this.messageService.add({
			severity: 'success',
			summary: 'Export',
			detail: 'Products exported successfully',
		});
	}

	private convertToCSV(products: Product[]): string {
		const headers = ['ID', 'Title', 'Price', 'Material', 'Category', 'Available', 'Featured', 'Sales', 'Rating'];
		const rows = products.map((p) => [
			p.id,
			p.title,
			p.price,
			p.material,
			this.getCategoryName(p),
			p.isAvailable ? 'Yes' : 'No',
			p.isFeatured ? 'Yes' : 'No',
			p.salesCount || 0,
			p.rating || 0,
		]);

		const csv = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
		return csv;
	}

	public getActionMenuItems(product: Product): any[] {
		return [
			{
				label: 'View More',
				icon: 'pi pi-eye',
				command: () => {
					this.editProduct(product);
				},
			},
			{
				label: 'Edit Product',
				icon: 'pi pi-pencil',
				command: () => {
					this.editProduct(product);
				},
			},
			{
				label: 'Delete',
				icon: 'pi pi-trash',
				command: () => {
					this.deleteProduct(product);
				},
			},
		];
	}

	public getStockStatusClasses(stockQuantity: number): string {
		if (stockQuantity > 0) {
			return 'text-xs rounded-full px-2 py-0.5 font-medium bg-green-50 text-green-700 dark:bg-green-500 dark:bg-opacity-15 dark:text-green-500';
		} else {
			return 'text-xs rounded-full px-2 py-0.5 font-medium bg-red-50 text-red-700 dark:bg-red-500 dark:bg-opacity-15 dark:text-red-500';
		}
	}

	public onCategoryFilterChange(event: any): void {
		this.categoryFilter = event.value;
		if (this.productTable) {
			if (event.value) {
				this.productTable.filter(event.value, 'productSubCategoryId', 'equals');
			} else {
				this.productTable.filter(null, 'productSubCategoryId', 'equals');
			}
		}
	}

	public onMaterialFilterChange(event: any): void {
		this.materialFilter = event.value;
		if (this.productTable) {
			if (event.value) {
				this.productTable.filter(event.value, 'material', 'equals');
			} else {
				this.productTable.filter(null, 'material', 'equals');
			}
		}
	}

	public clearFilters(): void {
		this.globalFilter = '';
		this.categoryFilter = null;
		this.materialFilter = null;
		if (this.productTable) {
			this.productTable.clear();
			this.productTable.reset();
		}
	}
}
