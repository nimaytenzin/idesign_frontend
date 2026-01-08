import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
	SmsTemplate,
	CreateSmsTemplateDto,
	UpdateSmsTemplateDto,
	SmsTemplateQueryDto,
	TriggerInfo,
	PlaceholderInfo,
	TestSmsTemplateDto,
	TestTemplateResponse,
} from './sms-template.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class SmsTemplateService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/sms-templates`;

	constructor(private http: HttpClient) {}

	/**
	 * Create a new SMS template
	 */
	createTemplate(templateData: CreateSmsTemplateDto): Observable<SmsTemplate> {
		return this.http.post<SmsTemplate>(this.apiUrl, templateData);
	}

	/**
	 * Get all SMS templates with optional filters
	 */
	getTemplates(query?: SmsTemplateQueryDto): Observable<SmsTemplate[]> {
		let params = new HttpParams();
		if (query) {
			if (query.triggerEvent) {
				params = params.set('triggerEvent', query.triggerEvent);
			}
			if (query.orderType) {
				params = params.set('orderType', query.orderType);
			}
			if (query.isActive !== undefined) {
				params = params.set('isActive', query.isActive.toString());
			}
		}
		return this.http.get<SmsTemplate[]>(this.apiUrl, { params });
	}

	/**
	 * Get SMS template by ID
	 */
	getTemplateById(id: number): Observable<SmsTemplate> {
		return this.http.get<SmsTemplate>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Update SMS template
	 */
	updateTemplate(id: number, templateData: UpdateSmsTemplateDto): Observable<SmsTemplate> {
		return this.http.patch<SmsTemplate>(`${this.apiUrl}/${id}`, templateData);
	}

	/**
	 * Delete SMS template
	 */
	deleteTemplate(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}

	/**
	 * Test SMS template with real order data
	 */
	testTemplate(id: number, testData: TestSmsTemplateDto): Observable<TestTemplateResponse> {
		return this.http.post<TestTemplateResponse>(`${this.apiUrl}/${id}/test`, testData);
	}

	/**
	 * Get available trigger events
	 */
	getAvailableTriggers(): Observable<TriggerInfo[]> {
		return this.http.get<TriggerInfo[]>(`${this.apiUrl}/triggers`);
	}

	/**
	 * Get available placeholders
	 */
	getAvailablePlaceholders(): Observable<PlaceholderInfo[]> {
		return this.http.get<PlaceholderInfo[]>(`${this.apiUrl}/placeholders`);
	}
}

