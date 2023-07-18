import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { DataTableAnnouncerComponent } from '../data-table-announcer/data-table-announcer.component';
import { DataTableComponent } from '../data-table/data-table.component';
import { RacesService } from '../races.service';
import { BoxesService } from '../boxes.service';
import { BibsService } from '../bibs.service';
import { SnackBarService, MessageType } from '../snack-bar.service';
import { ActivatedRoute } from '@angular/router';
import { AnnouncerService, Announcer } from '../announcer.service';
import { element } from 'protractor';
import { ConfigurationComponent } from '../configuration/configuration.component';
import { PasscodeService } from '../passcode.service';

@Component({
  selector: 'app-announcer',
  templateUrl: './announcer.component.html',
  styleUrls: ['./announcer.component.css']
})
export class AnnouncerComponent implements OnInit {
  public fieldsDescription: any;
  public boxes: any[];
  public selectedBox: any;
  public areTimesLoading: boolean;
  public eventId: number;
  public currentEventName: any;
  public currentBoxName: any;
  public raceId: number;
  public announcers: any;
  public accessCode: any;
  public isPassCodeVisible: boolean = true;
  private keepRefreshing: boolean = true;
  private isFirstUpdate: boolean = true;

  timer: any;
  sub: any;

  @ViewChild(DataTableAnnouncerComponent) dataTable: DataTableAnnouncerComponent;

  constructor(private racesService: RacesService,
    private announcerService: AnnouncerService,
    private boxesService: BoxesService,
    private snackBarService: SnackBarService,
    private passcodeService: PasscodeService,
    private route: ActivatedRoute) {
    this.fieldsDescription = Announcer.fieldsDescription;
    this.eventId = parseInt(this.route.snapshot.paramMap.get('eventId'));
  }

  ngOnInit() {
    let role = JSON.parse(localStorage.role);

    if (role.eventId != 0) {
      this.isPassCodeVisible = false;
    }

    this.boxes = [];
    this.selectedBox = null;
    this.areTimesLoading = true;
    this.getEventBoxes();

    this.passcodeService.getPasscodeByRoleAndEvent(this.eventId , 4).then(code =>{
      this.accessCode = code.Passcode;
    });

    this.announcerUpdate([]);
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  private getEventBoxes() {

    this.boxesService.getEventBoxList(this.eventId)
      .then(boxes => {
        if (boxes != null && boxes.length > 0) {
          this.boxes = boxes;
          this.selectedBox = boxes[0];
          this.currentBoxName = boxes[0].BoxName;
          this.reloadAnnouncer();
          this.resetTimer();
        }
      }).catch(error => {
        this.snackBarService.open('Erreur lors du chargement des épreuves', MessageType.Error);
        console.error(error);
      });
  }

  onBoxChange(event) {
    this.announcerUpdate([]);
    this.currentBoxName = event.value.Name;
    this.reloadAnnouncer();
  }

  private announcerUpdate(announcers: any[]): void {
    if (this.dataTable != null) {
      this.dataTable.announcerUpdate(announcers);
    }
  }

  private reloadAnnouncer() {
    this.areTimesLoading = true;
    this.announcerService.getReaderFilteredTimes(this.eventId, this.selectedBox.BoxNo).then((announcers) => {
      this.dataTable.setDataAnnouncerSource(announcers);
      if (this.isFirstUpdate) {
        this.isFirstUpdate = false;
        this.dataTable.sortItems('ChipTime');
        this.dataTable.sortItems('ChipTime');
      }
      this.areTimesLoading = false;
    }).catch(error => console.error(error));
  }

  private resetTimer() {
    this.timer = Observable.timer(1000);
    this.sub = this.timer.subscribe(t => this.getReaderFilteredTimes());
  }

  private getReaderFilteredTimes() {
    this.announcerService.getReaderFilteredTimes(this.eventId, this.selectedBox.BoxNo)
      .then((announcers) => {
        this.announcerUpdate(announcers);
        if (this.keepRefreshing) {
          this.resetTimer();
        }
      }).catch(error => {
        if (error.status === 401 || error.status === 403) {
          this.stopTimer();
        }
      });
  }

  private stopTimer() {
    this.keepRefreshing = false;
    if (this.sub != null) {
      this.sub.unsubscribe();
    }
    this.sub = null;
    this.timer = null;
  }
}
