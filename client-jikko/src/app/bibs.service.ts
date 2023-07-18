import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import {
  FieldDescription,
  BibNoDescription,
  ChipDescription
} from './field-description';

export class Bib {
  BibNo: number;
  Chip1: number;
  Chip2: number;

  constructor(bib: Bib = null) {

    if (bib) {
      for (var property in bib) {
        this[property] = bib[property];
      }
    }
  }

  static fieldsDescription: Map<string, FieldDescription> = new Map([
    ['BibNo', new BibNoDescription],
    ['Chip1', new ChipDescription(1)],
    ['Chip2', new ChipDescription(2)]
  ]);
};

@Injectable()
export class BibsService {
  static readonly apiUrl = './api/bibs/';

  constructor(private http: HttpClient) { }

  private static handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.feedbackMessage || error);
  }

  /**
   * Gets the bibs associated with an event id.
   *
   * @param {number} eventId  The id of the event
   * @returns A promise of the bibs array associated with the event
   */
  public getBibs(eventId: number): Promise<Bib[]> {
    return this.http.get(BibsService.apiUrl + eventId, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then(bibs => Array.from(bibs[0], bib => new Bib(bib as Bib)))
      .catch(BibsService.handleError);
  }

  /**
   * Creates a bib in an event.
   *
   * @param {number} eventId  The id of the event
   * @param {Bib} bib  The bib to create
   * @returns An empty promise
   */
  public addBib(eventId: number, bib: Bib): Promise<Bib[]> {
    return this.http.post(BibsService.apiUrl + eventId, bib, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then()
      .catch(BibsService.handleError);
  }

  /**
   * Removes a bib in an event.
   *
   * @param {number} eventId  The id of the event
   * @param {Bib} bibNo  The bib number to remove
   * @returns An empty promise
   */
  public removeBib(eventId: number, bibNo: number): Promise<Bib[]> {
    return this.http.delete(BibsService.apiUrl + eventId + '/' + bibNo, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then()
      .catch(BibsService.handleError);
  }
}
