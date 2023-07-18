import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import {
  FieldDescription,
  FirstNameDescription,
  LastNameDescription,
  PositionDescription,
  ChipTimeDescription,
  BoxNoDescription,
  DateModifiedDescription,
  BoxNameDescription,
  BibNoDescription,
  PositionDescriptionComboBox
} from './field-description';
import { LoginService } from './login.service';
import { ProtectedRouteService } from './protected-route.service';
import { PromiseObservable } from 'rxjs/observable/PromiseObservable';

export class FilteredTime {
  FirstName: string;
  LastName: string;
  Position: number;
  ChipTime: number;
  BibNo: number;
  DateModified: any;
  FilteredTimeId: number;

  constructor(filteredTime: FilteredTime = null) {
    this.FirstName = "";
    this.LastName = "";
    this.Position = NaN;
    this.ChipTime = NaN;
    this.BibNo = NaN;
    this.DateModified = null;

    if (filteredTime) {
      for (var property in filteredTime) {
        this[property] = filteredTime[property];
      }
    }
  }

  static fieldsDescription: Map<string, FieldDescription> = new Map([
    ['BibNo', new BibNoDescription],
    ['FirstName', new FirstNameDescription],
    ['LastName', new LastNameDescription],
    ['Position', new PositionDescription],
    ['ChipTime', new ChipTimeDescription],
    ['Name', new BoxNameDescription]
  ]);

  static customFieldsDescription: Map<string, FieldDescription> = new Map([
    ['BibNo', new BibNoDescription],
    ['Position', new PositionDescriptionComboBox],
    ['ChipTime', new ChipTimeDescription]
  ]);

};

@Injectable()
export class TimingService extends ProtectedRouteService {
  static readonly apiUrl = './api/timer/times/';

  constructor(private http: HttpClient, private loginService: LoginService) {
    super(loginService);
  }

  /**
   * Gets all the filtered times of a race.
   *
   * @param {number} eventId  The id of the event
   * @param {number} raceId  The id of the race
   * @returns A promise of the filtered times array
   */
  public getFilteredTimes(eventId: number, raceId: number): Promise<any[]> {
    return this.http.get(TimingService.apiUrl + eventId + '/' + raceId, {
      headers:
        new HttpHeaders().set('x-access-token', localStorage.token)
    })
      .toPromise()
      .then(data => {
        return Array.from(data[0], datum => new FilteredTime(datum as FilteredTime))
      })
      .catch(TimingService.handleError);
  }

  /**
   * Updates a filtered time from a race.
   *
   * @param {FilteredTime} filteredTime  The new filtered time with an existing FilteredTimeId
   * @returns An empty promise
   */
  public updateFilteredTime(filteredTime: FilteredTime) {
    return this.http.put(TimingService.apiUrl + filteredTime.FilteredTimeId, filteredTime, {
      headers:
        new HttpHeaders().set('x-access-token', localStorage.token)
    })
      .toPromise()
      .then()
      .catch(TimingService.handleError);
  }

  /**
   * Deletes a filtered time
   *
   * @param {FilteredTime} filteredTime  The filtered time to delete with an existing FilteredTimeId
   * @returns An empty promise
   */
  public deleteFilteredTime(filteredTime: FilteredTime) {
    return this.http.delete(TimingService.apiUrl + filteredTime.FilteredTimeId, {
      headers:
        new HttpHeaders().set('x-access-token', localStorage.token)
    })
      .toPromise()
      .then()
      .catch(TimingService.handleError);
  }

  /**
   * Gets all the filtered times of a race.
   *
   * @param {number} eventId  The id of the event
   * @param {number} raceId  The id of the race
   * @param {FilteredTime} filteredTime  The filtered time to create
   * @returns An empty promise
   */
  public addFilteredTime(eventId: number, raceId: number, filteredTime: FilteredTime) {
    return this.http.post(TimingService.apiUrl + eventId + '/' + raceId, filteredTime, {
      headers:
        new HttpHeaders().set('x-access-token', localStorage.token)
    })
      .toPromise()
      .then()
      .catch(TimingService.handleError);
  }

}
