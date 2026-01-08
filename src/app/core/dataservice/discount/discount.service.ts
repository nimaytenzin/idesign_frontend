import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	Discount,
	CreateDiscountDto,
	UpdateDiscountDto,
	DiscountResponseDto,
	DiscountQueryDto,
	CalculateDiscountDto,
	DiscountCalculationResult,
} from './discount.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class DiscountService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/discounts`;

	constructor(private http: HttpClient) {}

	/**
	 * Create a new discount
	 * Requires JWT authentication
	 */
	createDiscount(discountData: CreateDiscountDto): Observable<DiscountResponseDto> {
		return this.http.post<DiscountResponseDto>(this.apiUrl, discountData);
	}

	/**
	 * Get all discounts with optional filters
	 * Query Parameters:
	 * - isActive (optional): Filter by active status
	 * - discountType (optional): Filter by type
	 * Requires JWT authentication
	 */
	getDiscounts(query?: DiscountQueryDto): Observable<DiscountResponseDto[]> {
		let params = new HttpParams();
		if (query) {
			if (query.isActive !== undefined) {
				params = params.set('isActive', query.isActive.toString());
			}
			if (query.discountType) {
				params = params.set('discountType', query.discountType);
			}
		}
		return this.http.get<DiscountResponseDto[]>(this.apiUrl, { params });
	}

	/**
	 * Get single discount by ID
	 * Requires JWT authentication
	 */
	getDiscountById(id: number): Observable<DiscountResponseDto> {
		return this.http.get<DiscountResponseDto>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Update discount
	 * Requires JWT authentication
	 */
	updateDiscount(
		id: number,
		discountData: UpdateDiscountDto
	): Observable<DiscountResponseDto> {
		return this.http.patch<DiscountResponseDto>(
			`${this.apiUrl}/${id}`,
			discountData
		);
	}

	/**
	 * Delete discount
	 * Requires JWT authentication
	 */
	deleteDiscount(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Toggle discount active status
	 * Requires JWT authentication
	 */
	toggleDiscountActive(id: number): Observable<DiscountResponseDto> {
		return this.http.post<DiscountResponseDto>(
			`${this.apiUrl}/${id}/toggle-active`,
			{}
		);
	}

	/**
	 * Calculate discounts (Preview)
	 * Use this endpoint before creating an order to preview discount calculations
	 * Requires JWT authentication
	 */
	calculateDiscounts(
		calculationData: CalculateDiscountDto
	): Observable<DiscountCalculationResult> {
		return this.http.post<DiscountCalculationResult>(
			`${this.apiUrl}/calculate`,
			calculationData
		);
	}

	/**
	 * Get all active discounts (Public endpoint)
	 * No authentication required
	 */
	getActiveDiscountsPublic(): Observable<DiscountResponseDto[]> {
		return this.http.get<DiscountResponseDto[]>(`${this.apiUrl}/public/active`);
	}
}

