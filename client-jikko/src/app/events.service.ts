import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { LoginService } from './login.service';
import { ProtectedRouteService } from './protected-route.service';

@Injectable()
export class EventsService extends ProtectedRouteService {
  static readonly apiUrl = './api/events/';

  constructor(private http: HttpClient, private loginService: LoginService) {
    super(loginService);
  }

  /**
   * Gets all the existing events.
   *
   * @returns A promise of the events array
   */
  public getEvents() {
    return this.http.get(EventsService.apiUrl, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then(data => data[0] as any[])
      .catch(EventsService.handleError);
  }

  /**
   * Gets the event associated with an event id.
   *
   * @param {number} eventId  The id of the event to get
   * @returns A promise of the event associated with the event id
   */
  public getEvent(eventId: number) {
    return this.http.get(EventsService.apiUrl + eventId, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then(data => data[0][0] as any[])
      .catch(EventsService.handleError);
  }

  /**
   * Creates a new event.
   *
   * @param {any} event  The event to create
   * @returns The id of the new event
   */
  public addEvent(event: any)
  {
    return this.http.post(EventsService.apiUrl, event, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then(data => data[0][0].Id as number)
      .catch(EventsService.handleError);
  }

  /**
   * Deletes an event.
   *
   * @param {number} eventId  The id of the event to delete
   * @returns An empty promise
   */
  public deleteEvent(eventId: number) {
    return this.http.delete(EventsService.apiUrl + eventId, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then()
      .catch(EventsService.handleError);
  }

  /**
   * Updates an event.
   *
   * @param {number} eventId  The id of the event to update
   * @param {any} event  The new event
   * @returns An empty promise
   */
  public updateEvent(eventId: number, event: any) {
    return this.http.put(EventsService.apiUrl + eventId, event, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then()
      .catch(EventsService.handleError);
  }
}
