import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import {
  FieldDescription,
  FirstNameDescription,
  LastNameDescription,
  BibNoDescription,
  PositionDescription,
  ChipTimeDescription,
  GenderDescription,
  AgeDescription,
  CustomAttributeDescription,
  TeamDescription
} from './field-description';

export class Announcer {
  FirstName: string;
  Attribute01: string;
  Attribute02: string;
  Attribute03: string;
  Attribute04: string;
  Attribute05: string;
  LastName: string;
  BibNo: number;
  Position: number;
  ChipTime: number;
  Gender: number;
  Age: number;
  Team: string;
  FilteredTimeId: number;

  constructor(announcer: Announcer = null) {
    this.FirstName = '';
    this.LastName = '';
    this.Gender = NaN;
    this.Age = NaN;
    this.Team = '';
    this.BibNo = NaN;
    this.ChipTime = NaN;
    this.Position = NaN;
    this.Attribute01 = '';
    this.Attribute02 = '';
    this.Attribute03 = '';
    this.Attribute04 = '';
    this.Attribute05 = '';

    if (announcer) {
      for (var property in announcer) {
        this[property] = announcer[property];
      }
    }
  }

  static fieldsDescription: Map<string, FieldDescription> = new Map([
    ['BibNo', new BibNoDescription],
    ['FirstName', new FirstNameDescription],
    ['LastName', new LastNameDescription],
    ['Position', new PositionDescription],
    ['ChipTime', new ChipTimeDescription],
    ['Gender', new GenderDescription],
    ['Age', new AgeDescription],
    ['Team', new TeamDescription],
    ['Attribute01', new CustomAttributeDescription(1)],
    ['Attribute02', new CustomAttributeDescription(2)],
    ['Attribute03', new CustomAttributeDescription(3)],
    ['Attribute04', new CustomAttributeDescription(4)],
    ['Attribute05', new CustomAttributeDescription(5)]
  ]);
};

@Injectable()
export class AnnouncerService {
  static readonly apiUrl = './api/announcer/';

  constructor(private http: HttpClient) { }

  private static handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.feedbackMessage || error);
  }

  getReaderFilteredTimes(eventId: number, boxNo: number): Promise<any[]> {
    return this.http.get(AnnouncerService.apiUrl + eventId + '/' + boxNo, {
      headers:
        new HttpHeaders().set('x-access-token', localStorage.token)
    })
      .toPromise()
      .then(announcers => Array.from(announcers[0], announcer => new Announcer(announcer as Announcer)))
      .catch(AnnouncerService.handleError);
  }

}
