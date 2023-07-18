import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';
import { SnackBarService, MessageType } from '../snack-bar.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  providers: [LoginService]
})
export class HomePageComponent implements OnInit {

  public code: string;
  public events: any;
  public URL: string;
  private token: string;
  public isLoginLoading: boolean = false;

  constructor(private loginService: LoginService,
              private router: Router,
              private snackBarService: SnackBarService) {}

  ngOnInit() {
  }

  login() {
    this.isLoginLoading = true;
    this.loginService.login(this.code)
      .catch(error => {
        let message = error.status === 403 ? "Code d'accès invalide" : "Erreur lors de la connexion";
        this.snackBarService.open(message, MessageType.Error);
      }).then(() => this.isLoginLoading = false);
  }
}
