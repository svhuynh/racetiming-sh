import { Component, ElementRef, NgModule, NgZone, OnInit, ViewChild, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AgmCoreModule, MapsAPILoader } from '@agm/core';
import {} from '@types/googlemaps';

import { EventsService } from '../events.service';
import { RacesService } from '../races.service';
import { Observable } from 'rxjs';
import { SnackBarService, MessageType } from '../snack-bar.service';
import { SideNavService } from '../side-nav.service';

import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

import {DeleteDialogComponent} from '../delete-dialog/delete-dialog.component';

import {DuplicateRaceComponent} from '../duplicate-race/duplicate-race.component';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {

  public latitude: number;
  public longitude: number;
  public zoom: number;
  public eventId: number;
  public areRacesLoading: boolean;

  eventName: string;
  description: string;
  place: string; // For Google Map
  placeText: string; // For the UI
  dateStart: Date;
  timeStart: string;
  dateEnd: Date;
  timeEnd: string;

  event: any;
  races: any[];

  @ViewChild("search")
  public searchElementRef: ElementRef;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private eventsService: EventsService,
    public dialog: MatDialog,
    private racesService: RacesService,
    private router: Router,
    private snackBarService: SnackBarService,
    private sideNavService: SideNavService) {}

  ngOnInit() {
    this.eventId = parseInt(this.route.snapshot.paramMap.get('eventId'));
    this.races = [];
    this.areRacesLoading = true;

    this.eventsService.getEvent(this.eventId).then(event => {
      this.event = event;
      this.eventName = this.event.Name;
      this.description = this.event.Description;
      this.place = this.event.Place;
      this.placeText = this.event.Place;

      this.dateStart = ConfigurationComponent.formatDateForInput(new Date(this.event.StartDate));
      this.timeStart = ConfigurationComponent.formatTimeForInput(new Date(this.event.StartDate));

      this.dateEnd = ConfigurationComponent.formatDateForInput(new Date(this.event.EndDate));
      this.timeEnd = ConfigurationComponent.formatTimeForInput(new Date(this.event.EndDate));

      this.latitude = this.event.Latitude;
      this.longitude = this.event.Longitude;
      this.zoom = 17;

      this.refreshRaces();
    }).catch(error => console.error(error));

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: []
      });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 17;
          this.place = place.formatted_address;
        });
      });
    });
  }

  refreshRaces() {
    this.areRacesLoading = true;
    this.racesService.getRaces(this.eventId)
      .then((races) => {
        this.races = races;
        this.areRacesLoading = false;
      }).catch(error => {
        this.snackBarService.open("Erreur lors du chargement des épreuves", MessageType.Error);
        console.error(error);
      });
  }

  onSave(){
    this.event.Description = this.description;
    this.event.EndDate = ConfigurationComponent.dateTimeInputsToString(this.dateEnd, this.timeEnd);
    this.event.Latitude = this.latitude;
    this.event.Longitude = this.longitude;
    this.event.Name = this.eventName;
    this.event.Place = this.place;
    this.event.StartDate = ConfigurationComponent.dateTimeInputsToString(this.dateStart, this.timeStart);

    this.eventsService.updateEvent(this.eventId, this.event)
      .then(event => {
        this.router.navigate(['app/events/']);
        this.snackBarService.open("Événement sauvegardé", MessageType.Success);
      }).catch(error => {
        this.snackBarService.open("Erreur lors de la sauvegarde", MessageType.Error);
        console.error(error);
      });
  }

  onSaveAddRace(){

    this.event.Description = this.description;
    this.event.EndDate = ConfigurationComponent.dateTimeInputsToString(this.dateEnd, this.timeEnd);
    this.event.Latitude = this.latitude;
    this.event.Longitude = this.longitude;
    this.event.Name = this.eventName;
    this.event.Place = this.place;
    this.event.StartDate = ConfigurationComponent.dateTimeInputsToString(this.dateStart, this.timeStart);

    this.eventsService.updateEvent(this.eventId, this.event)
      .then(event => {
        this.router.navigate(['app/events/races/' + this.eventId + '/0']);
      }).catch(error => {
        console.error(error);
      });

  }

  onSaveEditRace(raceId : number){
    this.event.Description = this.description;
    this.event.EndDate = ConfigurationComponent.dateTimeInputsToString(this.dateEnd, this.timeEnd);
    this.event.Latitude = this.latitude;
    this.event.Longitude = this.longitude;
    this.event.Name = this.eventName;
    this.event.Place = this.place;
    this.event.StartDate = ConfigurationComponent.dateTimeInputsToString(this.dateStart, this.timeStart);

    this.eventsService.updateEvent(this.eventId, this.event)
      .then(event => {
        this.router.navigate(['app/events/races/' + this.eventId + '/' + raceId]);
      }).catch(error => {
        console.error(error);
      });
  }

  onDeleteEvent(){
    let deleteDialog = this.dialog.open(DeleteDialogComponent, {});
    deleteDialog.afterClosed().subscribe(isConfirmed => {
      if(isConfirmed) {
        this.eventsService.deleteEvent(this.eventId)
          .then(event => {
            this.router.navigate(['app/events/']);
            this.sideNavService.resetStoredEvent();
            this.snackBarService.open("Événement supprimé", MessageType.Success);
          }).catch(error => {
            this.snackBarService.open("Erreur lors de la suppression", MessageType.Error);
            console.error(error);
          });
      }
    });
  }

  static formatDateToString (date: Date): String
  {
    return date.getUTCDate() + "/" + (date.getUTCMonth() + 1) + "/" + date.getUTCFullYear();
  }

  static formatDateForInput (date: Date): Date
  {
    return new Date((date.getUTCMonth() + 1) + "/" + date.getUTCDate() + "/" + date.getUTCFullYear());
  }

  static formatTimeForInput (date: Date): string
  {
    return ("0" + date.getUTCHours()).slice(-2) + ":" + ("0" + date.getUTCMinutes()).slice(-2) + ":" + ("0" + date.getUTCSeconds()).slice(-2);
  }

  static dateTimeInputsToString (date: Date, time: string): string
  {
    if (time.length < 6) {
      time += ':00';
    }
    date.setUTCHours(parseInt(time.substring(0, 2)));
    date.setUTCMinutes(parseInt(time.substring(3, 5)));
    date.setUTCSeconds(parseInt(time.substring(6, 8)));
    return date.toISOString();
  }

  static dateInputToString (date: Date): string
  {
    return date.toISOString();
  }

  onDeleteRace(race: any, event: any) {
    let deleteDialog = this.dialog.open(DeleteDialogComponent, {});
    deleteDialog.afterClosed().subscribe(isConfirmed => {
      if(isConfirmed) {
        this.racesService.deleteRace(this.eventId, race.Id)
          .then(() => {
            this.refreshRaces();
            this.snackBarService.open("Épreuve supprimée", MessageType.Success);
          }).catch(error => {
            this.snackBarService.open("Erreur lors de la suppression", MessageType.Error);
            console.error(error);
          });
      }
    });
    if (event != null) {
      event.stopPropagation();
    }
  }

  markerMoved(e) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({'location': e.coords}, (res, status) => {
      if (status === google.maps.GeocoderStatus.OK && res.length) {
        this.event.Latitude = res[0].geometry.location.lat();
        this.event.Longitude = res[0].geometry.location.lng();
        this.place = res[0].formatted_address;
        this.placeText = res[0].formatted_address;
        this.ngZone.run(() => this.setLocation(res[0]));
      }
    })
  }

  setLocation(place) {
    this.latitude = place.geometry.location.lat(); this.longitude = place.geometry.location.lng();
  }

  onDuplicateRaceEvent() {
    let deleteDialog = this.dialog.open(DuplicateRaceComponent, {
      data: []
    });

    deleteDialog.afterClosed().subscribe(racesToDuplicate => {

      if(racesToDuplicate != undefined)
      {
        racesToDuplicate.forEach(race => {

          this.racesService.getRace(race.eventId, race.raceId).then((r) => {

            let parsedDisposition = JSON.parse(r.Disposition);
            let simplifiedDisposition = this.racesService.generateSimplifiedBoxes(parsedDisposition);

            r.SimplifiedDisposition = simplifiedDisposition;
            r.Disposition = parsedDisposition;

            this.racesService.addRace(this.eventId, r).then(i => {

              this.refreshRaces();

            }).catch(error => console.error(error));

          }).catch(error => console.error(error));

        });
      }

    });

  }

}
