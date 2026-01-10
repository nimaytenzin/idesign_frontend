import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
 
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../constants/paginated.response.interface';
import { CreateUserDto, GetUsersQueryDto, UpdateUserDto, User } from './user.interface';

@Injectable({
	providedIn: 'root',
})
export class UserDataService {
	private readonly apiUrl = `${environment.BASEAPI_URL}/auth`;

	constructor(private http: HttpClient) {}

    getAllUsersPaginated(queryDto: GetUsersQueryDto): Observable<PaginatedResponse<User>> {
        // Convert the queryDto to a plain object suitable for the HttpClient params
        let params = new HttpParams();
        if (queryDto.page) params = params.set('page', queryDto.page.toString());
        if (queryDto.limit) params = params.set('limit', queryDto.limit.toString());
        if (queryDto.role) params = params.set('role', queryDto.role);

        return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}/users`, { params });
    }

    updateUser(id: number, updateUserDto: UpdateUserDto): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/user/${id}`, updateUserDto);
    }


    createUser(createUserDto: CreateUserDto): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/user`, createUserDto);
    }

    /**
     * Upload Profile Picture - Admin, Staff and Affiliate Marketer
     * 
     * Endpoint: POST /auth/upload-profile-picture?userId={userId} (optional userId for admins)
     * Authentication: Required (JWT token in Authorization header)
     * Content-Type: multipart/form-data
     * 
     * @param file - The profile picture file to upload
     * @param userId - Optional user ID (Admin only - allows uploading profile picture for any user)
     * @returns Observable<User> - Updated user object with new profileImageUrl
     * 
     * PERMISSIONS:
     * - Admin: Can upload profile picture for any user by providing userId parameter
     * - Admin: Can upload their own profile picture by omitting userId parameter
     * - Staff/Affiliate Marketer: Can only upload their own profile picture (userId is ignored if provided)
     * 
     * Accepted formats: jpg, jpeg, png, gif, webp
     * Maximum file size: 5MB
     */
    uploadProfilePicture(file: File, userId?: number): Observable<User> {
        const formData = new FormData();
        formData.append('profilePicture', file);

        let url = `${this.apiUrl}/upload-profile-picture`;
        
        // Add userId as query parameter if provided (for admin uploading for another user)
        if (userId !== undefined && userId !== null) {
            url += `?userId=${userId}`;
        }

        return this.http.post<User>(url, formData);
    }
}
