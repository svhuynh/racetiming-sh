import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SideNavService } from './side-nav.service';
import { Router } from '@angular/router';
import { Role, LoginData } from './login-data';
import { SnackBarService, MessageType } from './snack-bar.service';

@Injectable()
export class LoginService {
    static readonly apiUrl = './api/login/';
    public static role: Role = null;

    constructor(private http: HttpClient,
                private sideNavService: SideNavService,
                private router: Router,
                private snackBarService: SnackBarService) {
        if (localStorage.role != null && localStorage.role !== '') {
            LoginService.role = new Role(JSON.parse(localStorage.role));
        }
    }

    private static handleError(error: any): Promise<any> {
        return Promise.reject(error.feedbackMessage || error);
    }

    /**
     * Gets the login data associated with a pass code and saves it to local storage.
     *
     * @param {string} code The pass code
     * @returns An empty promise
     */
    public login(code: string): Promise<void> {
        return this.getLoginData(code)
            .then(loginData => {
                if(loginData.token != undefined && loginData.token !== "") {
                    localStorage.token = loginData.token;
                    LoginService.role = loginData.role;
                    localStorage.role = JSON.stringify(loginData.role);
                    this.sideNavService.setRole(loginData.role);
                    this.router.navigate([loginData.role.redirectPath]);
                } else {
                    this.sideNavService.resetAllStoredData();
                }
            }).catch(LoginService.handleError);
    }

    /**
     * Gets the login data associated with a pass code.
     *
     * @param {string} code The pass code
     * @returns A promise of the login data
     */
    public getLoginData(code: string): Promise<LoginData> {
        return this.http.get(LoginService.apiUrl + code)
            .toPromise()
            .then(data => data['token'] != null ? new LoginData(data['token'], data['role'], data['eventId']) : null)
            .catch(LoginService.handleError);
    }

    /**
     * Gets the current role stored in the service.
     *
     * @returns The current role
     */
    public getRole() {
        return LoginService.role;
    }

    /**
     * Removes all the login data from local storage.
     *
     * @param {boolean} quit Redirects to login page if true
     */
    public logout(quit: boolean = true): void {
        localStorage.token = '';
        localStorage.role = '';
        LoginService.role = null;
        this.sideNavService.resetAllStoredData();
        if (quit) {
            this.router.navigate(['login']);
        }
    }
}
