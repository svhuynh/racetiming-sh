import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { SideNavService } from './side-nav.service';
import { LoginService } from './login.service'

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router,
                private sideNavService: SideNavService,
                private loginService: LoginService,
                private activatedRoute: ActivatedRoute) { }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        let role = this.loginService.getRole();
        
        if (route.data.page === 'login') {
            if (role != null) {
                this.router.navigate([role.redirectPath]);
                return false;
            } else {
                return true;
            }
        }
        else if (role != null) {
            if (!role.canActivate(route.data.page, route.params.eventId)) {
                this.router.navigate([role.redirectPath]);
                return false;
            } else {
                return true;
            }
        } else {
            this.router.navigate(['login']);
            return false;
        }
    }
}