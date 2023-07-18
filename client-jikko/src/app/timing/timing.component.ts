import { Component, OnInit, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { DataTableComponent } from '../data-table/data-table.component';
import { Observable, Subject } from 'rxjs/Rx';
import { TimingService, FilteredTime } from '../timing.service';
import { RacesService } from '../races.service';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { SnackBarService, MessageType } from '../snack-bar.service';
import { ActivatedRoute } from '@angular/router';

declare var require: any;

@Component({
  selector: 'app-timing',
  templateUrl: './timing.component.html',
  styleUrls: ['./timing.component.css']
})
export class TimingComponent implements OnInit {
  public fieldsDescription: any;
  public races: any[];
  public selectedRace: any;
  public eventId: number;
  public filteredTimes: any[];
  public isFilteredTimesFullScreen: boolean = false;
  public isParticipantsResultsFullScreen: boolean = false;
  private keepRefreshing: boolean = true;

  constructor(private racesService: RacesService,
    private timingService: TimingService,
    private snackBarService: SnackBarService,
    private route: ActivatedRoute) { }

  timer: any;
  sub: any;

  ngOnInit() {
    this.races = [];
    this.selectedRace = null;
    this.eventId = parseInt(this.route.snapshot.paramMap.get('eventId'));
    this.getEventRaces();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  private getEventRaces() {
    this.racesService.getRaces(this.eventId)
      .then(races => {
        if (races != null && races.length > 0) {
          this.races = races;
          this.selectedRace = races[0];
          this.resetTimer();
        }
      }).catch(error => {
        this.snackBarService.open("Erreur lors du chargement des épreuves", MessageType.Error);
        console.error(error);
      }) 
  }

  private resetTimer() {
    this.timer = Observable.timer(1500);
    this.sub = this.timer.subscribe(t => this.getFilteredTimes());
  }

  private getFilteredTimes() {
    if (this.timingService != null && this.eventId > 0 && this.selectedRace.Id > -1) {
      this.timingService.getFilteredTimes(this.eventId, this.selectedRace.Id)
        .then((filteredTimes) => {
          this.filteredTimes = filteredTimes;
          if (this.keepRefreshing) {
            this.resetTimer();
          }
        }).catch(error => {
          if (error.status === 401 || error.status === 403) {
            this.stopTimer();
          }
        });
    }
  }

  public onFilteredTimesFullScreen() {
    this.isFilteredTimesFullScreen = !this.isFilteredTimesFullScreen;
  }

  public onParticipantsResultsFullScreen() {
    this.isParticipantsResultsFullScreen = !this.isParticipantsResultsFullScreen;
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.keyCode === 27) { // Escape
      this.isFilteredTimesFullScreen = false;
      this.isParticipantsResultsFullScreen = false;
    }
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
