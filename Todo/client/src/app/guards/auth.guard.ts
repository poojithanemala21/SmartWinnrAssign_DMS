import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        console.log(`AuthGuard checking access for: ${state.url}`);
        if (this.authService.isLoggedIn()) {
            console.log('AuthGuard: Access granted');
            return true;
        }

        console.log('AuthGuard: Access denied, redirecting to login');
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}
