import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { DataTableComponent } from '../data-table/data-table.component';
import { TimingService, FilteredTime } from '../timing.service';
import { ActivatedRoute } from '@angular/router';
import { SnackBarService, MessageType } from '../snack-bar.service';
import { BibsService } from '../bibs.service';
import { RacesService } from '../races.service';
import { element } from 'protractor';

import { ConfigurationComponent } from '../configuration/configuration.component';

import {RawTimesDialogComponent} from '../raw-times-dialog/raw-times-dialog.component';

import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-filtered-times',
  templateUrl: './filtered-times.component.html',
  styleUrls: ['./filtered-times.component.css']
})
export class FilteredTimesComponent implements OnInit {
  public fieldsDescription: any;
  public areTimesLoading: boolean;
  public eventId: number;
  public raceId: number;
  @Input() set selectedRace(selectedRace: any) {
    this.raceId = selectedRace != null ? selectedRace.Id : 0;
    this.reloadFilteredTimes();
  }
  @Input() set filteredTimes(filteredTimes: any[]) {
    this.passiveUpdate(filteredTimes);
  }
  @Output() fullScreenClick: EventEmitter<any> = new EventEmitter();
  @ViewChild(DataTableComponent) dataTable: DataTableComponent;

  constructor(private timingService: TimingService,
    private snackBarService: SnackBarService,
    private bibsService: BibsService,
    public dialog: MatDialog,
    private racesService: RacesService,
    private route: ActivatedRoute) {
    this.fieldsDescription = FilteredTime.fieldsDescription;

    this.disableFields(true);

    this.eventId = parseInt(this.route.snapshot.paramMap.get('eventId'));
  }

  ngOnInit() {
    this.dataTable.defaultSettings();
    this.areTimesLoading = false;
  }

  private reloadFilteredTimes() {
    this.areTimesLoading = true;

    this.timingService.getFilteredTimes(this.eventId, this.raceId).then((filteredTimes) => {
      this.dataTable.setDataSource(filteredTimes);
      this.dataTable.sortItems("ChipTime");
      this.areTimesLoading = false;
    }).catch(error => console.error(error));
  }

  public onAddClick() {

    this.bibsService.getBibs(this.eventId)
      .then(bibs => {

        this.racesService.getDisposition(this.eventId, this.raceId).then((disposition) => {

          let positions = [];

          disposition.forEach(element => {
            positions.push(element.Position);
          });

          let comboBoxData = {
            bibs: bibs,
            positions: positions
          };

          this.dataTable.openCustomAddDialog("Ajouter une lecture", new FilteredTime(), FilteredTime.customFieldsDescription, comboBoxData);

        }).catch(error => console.error(error));

      }).catch(error => {
        console.error(error);
      });

  }

  public onAddSave(filteredTime) {

    filteredTime.ChipTime = ConfigurationComponent.dateTimeInputsToString(new Date(), filteredTime.ChipTime);

    this.timingService.addFilteredTime(this.eventId, this.raceId, filteredTime)
      .then(() => {
        this.snackBarService.open("Lecture ajoutée", MessageType.Success);
      }).catch(error => {
        this.snackBarService.open("Erreur lors de la création", MessageType.Error);
        console.error(error);
      });

  }

  private passiveUpdate(filteredTimes: any[]): void {
    if (this.dataTable != null) {
      this.dataTable.passiveUpdate(filteredTimes);
    }
  }

  public onEditSelection(filteredTime) {

    filteredTime.ChipTime = ConfigurationComponent.dateTimeInputsToString(new Date(), filteredTime.ChipTime);

    this.timingService.updateFilteredTime(filteredTime)
      .then(() => {
        this.snackBarService.open("Élément modifié", MessageType.Success);
        this.dataTable.clearSelection();
      }).catch(error => {
        this.snackBarService.open("Erreur lors de la modification", MessageType.Error);
        console.error(error);
      });

  }

  public onDeleteSelection(filteredTimes): void {
    filteredTimes.forEach(filteredTime => {
      if (filteredTime != null) {
        this.timingService.deleteFilteredTime(filteredTime)
          .then(() => {
            let message = filteredTimes.length > 1 ? "Lectures supprimées" : "Lecture supprimée";
            this.snackBarService.open(message, MessageType.Success);
          }).catch(error => {
            this.snackBarService.open("Erreur lors de la suppression", MessageType.Error);
            console.error(error);
          });
      }
    });
  }

  private disableFields(bool: boolean) {
    this.fieldsDescription.get("BibNo").disabled = bool;
    this.fieldsDescription.get("FirstName").disabled = bool;
    this.fieldsDescription.get("LastName").disabled = bool;
    this.fieldsDescription.get("Position").disabled = bool;
    this.fieldsDescription.get("Name").disabled = bool;
  }

  public onFullScreenClick() {
    this.fullScreenClick.emit();
  }

  public showRawTimes() {
    let selectedRow: any = this.dataTable.getSelectedRow();
    let bibNo: number = selectedRow != null ? selectedRow.BibNo : null;
    let rawTimeDialog = this.dialog.open(RawTimesDialogComponent, {
      data: { eventId: this.eventId, raceId: this.raceId, bibNo: bibNo }
    });
  }

}
