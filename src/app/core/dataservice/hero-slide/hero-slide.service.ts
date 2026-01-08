import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HeroSlide, ReorderSlidesDto } from './hero-slide.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class HeroSlideService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/hero-slides`;

	constructor(private http: HttpClient) {}

	/**
	 * Create a new hero slide with image upload
	 * @param formData FormData containing image file and slide data
	 * @returns Observable<HeroSlide>
	 */
	create(formData: FormData): Observable<HeroSlide> {
		return this.http.post<HeroSlide>(this.apiUrl, formData);
	}

	/**
	 * Get all hero slides (including inactive)
	 * @param includeInactive Whether to include inactive slides
	 * @returns Observable<HeroSlide[]>
	 */
	findAll(includeInactive: boolean = true): Observable<HeroSlide[]> {
		const params = new HttpParams().set('includeInactive', includeInactive.toString());
		return this.http.get<HeroSlide[]>(this.apiUrl, { params });
	}

	/**
	 * Get all active hero slides (public endpoint)
	 * Only returns slides where isActive = true, ordered by order field
	 * @returns Observable<HeroSlide[]>
	 */
	getActiveSlides(): Observable<HeroSlide[]> {
		// includeInactive=false by default, so we don't need to pass it
		return this.http.get<HeroSlide[]>(this.apiUrl);
	}

	/**
	 * Get a single hero slide by ID
	 * @param id Slide ID
	 * @returns Observable<HeroSlide>
	 */
	findOne(id: number): Observable<HeroSlide> {
		return this.http.get<HeroSlide>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Get a single hero slide by ID (public endpoint)
	 * @param id Slide ID
	 * @returns Observable<HeroSlide>
	 */
	getSlide(id: number): Observable<HeroSlide> {
		return this.http.get<HeroSlide>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Update a hero slide (with optional image upload)
	 * @param id Slide ID
	 * @param formData FormData containing optional image file and slide data
	 * @returns Observable<HeroSlide>
	 */
	update(id: number, formData: FormData): Observable<HeroSlide> {
		return this.http.patch<HeroSlide>(`${this.apiUrl}/${id}`, formData);
	}

	/**
	 * Delete a hero slide
	 * @param id Slide ID
	 * @returns Observable<void>
	 */
	remove(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Reorder hero slides
	 * @param slideIds Array of slide IDs in the desired order
	 * @returns Observable<HeroSlide[]>
	 */
	reorder(slideIds: number[]): Observable<HeroSlide[]> {
		const body: ReorderSlidesDto = { slideIds };
		return this.http.post<HeroSlide[]>(`${this.apiUrl}/reorder`, body);
	}
}

