import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class DocumentService {
    private apiUrl = 'http://127.0.0.1:5000/api/documents';

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders() {
        const user = this.authService.currentUserValue;
        return new HttpHeaders({
            'Authorization': `Bearer ${user.token}`
        });
    }

    getDocuments(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
    }

    uploadDocument(formData: FormData): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.authService.currentUserValue.token}`
            // Don't set Content-Type, let the browser set it with boundary for FormData
        });
        
        return this.http.post<any>(this.apiUrl, formData, { headers }).pipe(
            // Unwrap the response if it's wrapped in a data property
            map(response => {
                console.log('📥 Document Service - Upload Response:', response);
                // Return the data property if it exists, otherwise return the whole response
                return response?.data || response;
            })
        );
    }

    updateVersion(id: string, formData: FormData): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.authService.currentUserValue.token}`
        });
        return this.http.put<any>(`${this.apiUrl}/${id}/version`, formData, { headers });
    }

    searchDocuments(query: string, tags: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/search?query=${query}&tags=${tags}`, { headers: this.getHeaders() });
    }

    updatePermissions(id: string, userId: string, accessType: string): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}/permissions`, { userId, accessType }, { headers: this.getHeaders() });
    }

    getVersionHistory(id: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${id}/versions`, { headers: this.getHeaders() });
    }
}
