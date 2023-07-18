import { Component, OnInit, Inject, HostListener, ViewChild, Input } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatIconRegistry } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { ParticipantsService, Participant } from '../participants.service';
import { RacesService } from '../races.service';
import { ActivatedRoute } from '@angular/router';
import { DataTableComponent } from '../data-table/data-table.component';
import { ConfigurationComponent } from '../configuration/configuration.component';
import { SideNavService } from '../side-nav.service';
import { EventsService } from '../events.service';
import { SnackBarService, MessageType } from '../snack-bar.service';
import { DownloadExcelFileComponent } from '../download-excel-file/download-excel-file.component';
import { PasscodeService } from '../passcode.service';

@Component({
  selector: 'app-participants',
  templateUrl: './participants.component.html',
  styleUrls: ['./participants.component.css']
})

export class ParticipantsComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTable: DataTableComponent;
  @ViewChild(DownloadExcelFileComponent) excelFile: DownloadExcelFileComponent;
  public eventId: number;
  public races: any[];
  public selectedRace: any;
  public areParticipantsLoading: boolean;
  public fieldsDescription: any;
  public currentEventName: any;
  public currentRaceName: any;
  public accessCode: any;
  public isPassCodeVisible: boolean = true;
  public allBibsNumber: any[];
  public oldBibNumber: any;
  public participants: Participant[] = [];

  constructor(public dialog: MatDialog,
              private participantsService: ParticipantsService,
              private racesService: RacesService,
              private sideNavService: SideNavService,
              private route: ActivatedRoute,
              private eventsService: EventsService,
              private passcodeService: PasscodeService,
              private snackBarService: SnackBarService) {
    this.fieldsDescription = Participant.fieldsDescription;
  }

  ngOnInit() {

    let role = JSON.parse(localStorage.role);

    if (role.eventId != 0) {
      this.isPassCodeVisible = false;
    }

    this.dataTable.defaultSettings();
    this.races = [];
    this.selectedRace = null;
    this.areParticipantsLoading = true;
    this.eventId = parseInt(this.route.snapshot.paramMap.get('eventId'));

    this.getEventName();
    this.getEventRaces();

    this.passcodeService.getPasscodeByRoleAndEvent(this.eventId , 3).then(code =>{
      this.accessCode = code.Passcode;
    });
  }

  private getEventName() {
    this.eventsService.getEvent(this.eventId)
      .then(event => {
        this.currentEventName = event.Name;
      }).catch(error => console.error(error));
  }

  private getEventRaces() {
    this.racesService.getRaces(this.eventId)
      .then(races => {
        if (races != null && races.length > 0) {
          this.races = races;
          this.selectedRace = races[0];
          this.currentRaceName = races[0].Name;
          this.refreshParticipants();
        }
      }).catch(error => {
        this.snackBarService.open("Erreur lors du chargement des épreuves", MessageType.Error);
        console.error(error);
      }).then(() => {
        this.areParticipantsLoading = false;
      });
  }

  onAddParticipant() {
  }

  onRaceChange(event) {
    this.currentRaceName = event.value.Name;
    this.refreshParticipants();
  }

  refreshParticipants() {
    this.dataTable.setDataSource([]);
    this.areParticipantsLoading = true;

    this.participantsService.getParticipants(this.eventId, this.selectedRace.Id)
      .then(participants => {
        this.participants = participants;
        if (participants != null) {
          this.dataTable.setDataSource(Array.from(participants, participant => Object.assign({}, participant)));
          
          this.allBibsNumber = [];

          participants.forEach(participant => {
            this.allBibsNumber.push(participant.BibNo);
          });

          // console.log(this.allBibsNumber);

        }
      }).catch(error => {
        this.snackBarService.open("Erreur lors du chargement des participants", MessageType.Error);
        console.error(error);
      }).then(() => {
        this.dataTable.clearSelection();
        this.areParticipantsLoading = false;
      });
  }

  public onAddClick() {
    this.dataTable.openAddDialog("Ajouter un participant", new Participant());
  }

  public onAddSave(participant) {
    participant.BirthDate = participant.BirthDate !== null ? participant.BirthDate.toISOString().substring(0, 10) : null;
    participant.RegistrationDate = participant.RegistrationDate !== null ? participant.RegistrationDate.toISOString().substring(0, 10) : null;

    // console.log("Sent participant:");
    // console.log(participant);

    if(!this.allBibsNumber.includes(participant.BibNo))
    {
      this.participantsService.addParticipant(this.eventId, this.selectedRace.Id, participant)
      .then(() => {
        this.snackBarService.open("Participant ajouté", MessageType.Success);
      }).catch(error => {
        this.snackBarService.open("Erreur lors de l'ajout du participant", MessageType.Error);
        console.error(error);
      }).then(() => {
        this.refreshParticipants();
      });
    }
    else
    {
      this.snackBarService.open("Le numéro de dossard est déjà utilisé", MessageType.Error);
    }
  }

  public editClick(participant): void {
    this.oldBibNumber = participant.BibNo;
    // console.log(participant.BibNo);
  }

  public onEditSelection(participant): void {
    // Convert dates
    if (participant.BirthDate != null) {
      participant.BirthDate = participant.BirthDate.toISOString().substring(0, 10);
    }
    if (participant.RegistrationDate != null) {
      participant.RegistrationDate = participant.RegistrationDate.toISOString().substring(0, 10);
    }

    // console.log("Sent participant:");
    // console.log(participant);

    // if(!this.allBibsNumber.includes(participant.BibNo))
    if(participant.BibNo == this.oldBibNumber)
    {
      this.participantsService.updateParticipant(this.eventId, this.selectedRace.Id, participant.Id, participant)
      .then(() => {
        this.snackBarService.open("Participant modifié", MessageType.Success);
      }).catch(error => {
        this.snackBarService.open("Erreur lors de la modification du participant", MessageType.Error);
        console.error(error);
      }).then(() => {
        this.dataTable.clearSelection();
        this.refreshParticipants();
      });
    }
    else if(!this.allBibsNumber.includes(participant.BibNo))
    {
      this.participantsService.updateParticipant(this.eventId, this.selectedRace.Id, participant.Id, participant)
      .then(() => {
        this.snackBarService.open("Participant modifié", MessageType.Success);
      }).catch(error => {
        this.snackBarService.open("Erreur lors de la modification du participant", MessageType.Error);
        console.error(error);
      }).then(() => {
        this.dataTable.clearSelection();
        this.refreshParticipants();
      });
    }
    else
    {
      this.snackBarService.open("Le numéro de dossard est déjà utilisé", MessageType.Error);
    }
  }

  public onDeleteSelection(participants): void {
    this.dataTable.setDataSource([]);
    this.areParticipantsLoading = true;

    let deleteParticipantPromises = [];
    participants.forEach(participant => {
      if (participant != null) {
        deleteParticipantPromises.push(this.participantsService.deleteParticipant(this.eventId, this.selectedRace.Id, participant.Id));
      }
    });

    Promise.all(deleteParticipantPromises)
      .then(() => {
        let message = participants.length > 1 ? "Participants supprimés" : "Participant supprimé";
        this.snackBarService.open(message, MessageType.Success);
      }).catch(error => {
        this.snackBarService.open("Erreur lors de la suppression d'un ou de plusieurs participants", MessageType.Error);
        console.error(error);
      }).then(() => {
        this.dataTable.clearSelection();
        this.refreshParticipants();
      });
  }

  public downloadJSONToXLSX() {
    try {
      this.excelFile.exportAsExcelFile(this.participants, this.currentRaceName, "Participants_" + this.currentEventName + "_" + this.currentRaceName);
    } catch(error) {
      this.snackBarService.open("Erreur lors du téléchargement des participants", MessageType.Error);
      console.error(error);
    }
  }

  public onFileUploadStarted() {
    this.dataTable.setDataSource([]);
    this.areParticipantsLoading = true;
  }

}

export interface Races {
  Id: number;
  Name: string;
  StarDate: string;
}
