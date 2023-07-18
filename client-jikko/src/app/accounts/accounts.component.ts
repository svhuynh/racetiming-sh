import { Component, OnInit } from '@angular/core';
import { PasscodeService } from '../passcode.service';
import { SnackBarService, MessageType } from '../snack-bar.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {

  public allCodes: any[];
  public areCodesLoading = false;

  constructor(private passcodeService: PasscodeService,
              private snackBarService: SnackBarService) {}

  ngOnInit() {
    this.refreshCodes();
  }

  onCreate() {
    this.passcodeService.generateAdminPasscode().then( code => {
      this.refreshCodes();
      this.snackBarService.open("Code d'accès généré", MessageType.Success);
    }).catch(error => {
      this.snackBarService.open("Erreur lors de la génération du code d'accès", MessageType.Error);
      console.error(error);
    });
  }

  onDelete(code: string) {
    this.passcodeService.deletePasscode(code).then(() => {
      this.refreshCodes();
      this.snackBarService.open("Code d'accès supprimé", MessageType.Success);
    })
    .catch(error => {
      this.snackBarService.open("Erreur lors de la suppression du code d'accès", MessageType.Error);
      console.error(error);
    });
  }

  refreshCodes() {
    this.areCodesLoading = true;
    this.passcodeService.getPasscodeByRole(2).then(codes =>{
      this.allCodes = codes;
    }).catch(error => {
      this.snackBarService.open("Erreur lors du chargement des codes d'accès", MessageType.Error);
      console.error(error);
    }).then(() => {
      this.areCodesLoading = false;
    });
  }

}
