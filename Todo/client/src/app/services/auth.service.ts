import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject: BehaviorSubject<any>;
    public currentUser: Observable<any>;
    private apiUrl = 'http://127.0.0.1:5000/api/auth';

    constructor(private http: HttpClient) {
        let savedUser = null;
        try {
            const data = localStorage.getItem('currentUser');
            savedUser = data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error parsing saved user', e);
            localStorage.removeItem('currentUser');
        }
        this.currentUserSubject = new BehaviorSubject<any>(savedUser || {});
        this.currentUser = this.currentUserSubject.asObservable();
        console.log('AuthService initialized. Current user:', this.currentUserSubject.value);
    }

    public get currentUserValue(): any {
        return this.currentUserSubject.value;
    }

    login(email: string, password: string): Observable<any> {
        console.log(`Attempting login for ${email}`);
        return this.http.post<any>(`${this.apiUrl}/login`, { email, password })
            .pipe(map(user => {
                console.log('Login response received:', user);
                if (user && user.token) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                    console.log('User logged in and state updated');
                }
                return user;
            }));
    }

    register(username: string, email: string, password: string): Observable<any> {
        console.log(`Attempting register for ${email}`);
        return this.http.post<any>(`${this.apiUrl}/register`, { username, email, password })
            .pipe(map(user => {
                console.log('Registration response received:', user);
                return user;
            }));
    }

    logout() {
        console.log('Logging out');
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next({});
    }

    isLoggedIn(): boolean {
        const loggedIn = !!this.currentUserSubject.value.token;
        console.log('Auth check (isLoggedIn):', loggedIn);
        return loggedIn;
    }

    getUsers(): Observable<any[]> {
        const user = this.currentUserSubject.value;
        return this.http.get<any[]>(`${this.apiUrl}/users`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
    }

    forgotPassword(email: string): Observable<any> {
        console.log(`Attempting forgot password for ${email}`);
        return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
    }
}