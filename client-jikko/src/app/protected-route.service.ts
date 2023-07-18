import { LoginService } from './login.service';

export class ProtectedRouteService {
  private static loginService: LoginService = null;

  constructor(loginService: LoginService) {
    ProtectedRouteService.loginService = loginService;
  }

  protected static handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    if (error.status === 403) {
      ProtectedRouteService.loginService.logout();
    }
    return Promise.reject(error.feedbackMessage || error);
  }
}
