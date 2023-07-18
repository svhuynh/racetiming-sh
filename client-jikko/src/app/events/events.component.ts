import { Component, OnInit } from '@angular/core';
import { EventsService } from '../events.service';
import { Router } from '@angular/router';
import { ConfigurationComponent } from '../configuration/configuration.component'
import { SideNavService } from '../side-nav.service';

interface NewEvent {
  Description : string;
  EndDate : string;
  Latitude : number;
  Longitude : number;
  Name : string;
  Place : string;
  StartDate : string;
}

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  public areEventsLoading: boolean;
  private allEvents: any;
  private newEvent: NewEvent;
  private filteredEvents: any[];
  public renderedEvents: any[];
  public textFilter: string;
  public dateFilter: string;

  constructor(private eventsService: EventsService,
    private router: Router) { }

  ngOnInit() {
    this.newEvent = {} as NewEvent;
    this.textFilter = "";
    this.dateFilter = "all";
    this.areEventsLoading = true;

    this.eventsService.getEvents()
    .then(events => {
      if (events != null) {
        this.allEvents = events;
        this.allEvents.sort((a, b) => a.StartDate < b.StartDate ? 1 : -1);
        this.renderedEvents = this.allEvents;
      }
    }).catch(error => console.error(error))
    .then(() => {
      this.areEventsLoading = false;
    });
  }

  onCreate() {
    let timeZoneOffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    this.newEvent.Description = "";
    this.newEvent.EndDate = (new Date(Date.now() - timeZoneOffset)).toISOString();
    this.newEvent.Latitude = 45.5016889;
    this.newEvent.Longitude = -73.56725599999999;
    this.newEvent.Name = "";
    this.newEvent.Place = "Montréal, QC, Canada";
    this.newEvent.StartDate = (new Date(Date.now() - timeZoneOffset)).toISOString();

    this.eventsService.addEvent(this.newEvent).then((eventId) => {
        this.router.navigate(['app/events/' + eventId]);
    }).catch(error => console.error(error));
  }

  getEventThumbnail(event: any): string {
    const apiUrl = "https://maps.googleapis.com/maps/api/staticmap";
    const apiKey = "AIzaSyDE39kcZU02NcTfzg4_WV61pLiBp8zpqbM";
    const parameters =
      `?center=${event.Latitude},${event.Longitude}
      &zoom=13
      &size=550x150
      &maptype=roadmap
      &format=jpg
      &style=feature:all|element:all|saturation:32|lightness:-3|visibility:on|weight:1.18
      &style=feature:landscape.man_made|element:all|saturation:-70|lightness:14
      &style=feature:water|element:all|saturation:100|lightness:-14
      &style=element:labels%7Cvisibility:off&style=feature:administrative.land_parcel%7Cvisibility:off&style=feature:administrative.neighborhood%7Cvisibility:off`
    return apiUrl + parameters + "&key=" + apiKey;
  }

  public filterEvents(): void {
    this.renderedEvents = this.allEvents;
    this.renderedEvents = this.filterEventsDate(this.renderedEvents, this.dateFilter);
    this.renderedEvents = this.filterEventsText(this.renderedEvents, this.textFilter);
  }

  private filterEventsDate(events: any[], dateFilter: string): any[] {
    let fileredEvents = events.filter(event => {
      let currentDate = new Date();
      let eventDate = ConfigurationComponent.formatDateForInput(new Date(event.StartDate));
      if (dateFilter == "all") {
        return true;
      } else if (dateFilter == "toCome") {
        return currentDate <= eventDate;
      } else if (dateFilter == "past") {
        return currentDate > eventDate;
      }
    });
    return fileredEvents;
  }

  private filterEventsText(events: any[], textFilter: string): any[] {
    let filteredEvents = events.filter(event => {
      let searchStr = event.Name + event.Description + event.Place;
      searchStr = searchStr.toLowerCase();
      return searchStr.indexOf(textFilter.toLowerCase()) != -1;
    });
    return filteredEvents;
  }

  public clearFilter() {
    this.textFilter = '';
    this.filterEvents();
  }

}
