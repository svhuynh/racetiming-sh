import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { SideNavService } from './side-nav.service';
import { Router } from '@angular/router';
import { Role, LoginData } from './login-data';
import { LoginService } from './login.service';
import { ProtectedRouteService } from './protected-route.service';

@Injectable()
export class PasscodeService extends ProtectedRouteService {
    static readonly apiUrl = './api/passcodes/';
    public static role: Role = null;

    constructor(private http: HttpClient, private loginService: LoginService, private router: Router) {
        super(loginService);
      }

    /**
     * Gets the generated pass code for a specified role. This only works for role 2 (timer) as other
     * roles are associated to events (except admin).
     *
     * @param {number} eventId  The id of the event
     * @param {number} role  The role number
     * @returns A promise of the pass codes array
     */
    public getPasscodeByRole(role: number): Promise<any> {
        return this.http.get(PasscodeService.apiUrl + role, {headers:
          new HttpHeaders().set('x-access-token', localStorage.token)
         })
        .toPromise()
        .then(data => data as any[])
        .catch(PasscodeService.handleError);
    }

    /**
     * Gets the generated pass code for a specified event and role
     *
     * @param {number} eventId  The id of the event
     * @param {number} role  The role number
     * @returns A promise of the pass code
     */
    public getPasscodeByRoleAndEvent(eventId: number, role: number): Promise<any> {
      return this.http.get(PasscodeService.apiUrl + eventId + "/" + role, {headers:
        new HttpHeaders().set('x-access-token', localStorage.token)
       })
      .toPromise()
      .then(data => data as any[])
      .catch(PasscodeService.handleError);
    }
    
    /**
     * Generates a pass code for role 2 (timer).
     *
     * @returns A promise of the pass code
     */
    public generateAdminPasscode(): Promise<any> {
        return this.http.get(PasscodeService.apiUrl + "admin/codes/generate", {
            headers:
                new HttpHeaders().set('x-access-token', localStorage.token)
        })
        .toPromise()
        .then(data => data as any[])
        .catch(PasscodeService.handleError);
    }

    /**
     * Deletes a pass code for role 2 (timer).
     *
     * @param {string} passcode  The pass code to delete
     * @returns An empty promise
     */
    public deletePasscode(passcode: string): Promise<any>{
        return this.http.delete(PasscodeService.apiUrl + passcode, {
            headers:
                new HttpHeaders().set('x-access-token', localStorage.token)
        })
        .toPromise()
        .then()
        .catch(PasscodeService.handleError);
    }
}