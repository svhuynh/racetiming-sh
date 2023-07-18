import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FieldDescription,
  BibNoDescription,
  FirstNameDescription,
  LastNameDescription,
  GGRankDescription,
  GunTimeDescription,
  OGRankDescription,
  TeamDescription,
  LastChipTimeDescription,
  FinishTimeDescription,
  GenderDescription,
  RhythmDescription,
  CategoryDescription,
  CategoryRankDescription,
  CustomAttributeDescription
 } from './field-description';
import { LoginService } from './login.service';
import { ProtectedRouteService } from './protected-route.service';

export class PublicResults {
  BibNo: number; // ok
  FirstName: string; // ok
  LastName: string; // ok
  GGRank: string; // ok
  GunTime: string; // ok
  OGRank: string; // ok
  Team: string;
  ChipTime: string; // ok
  FinishTime: string; // ok
  Gender: number; // ok
  Rhythm: number; //
  


  static fieldsDescription: Map<string, FieldDescription> = new Map([
    ['OGRank', new OGRankDescription],
    ['BibNo', new BibNoDescription],
    ['FirstName', new FirstNameDescription],
    ['LastName', new LastNameDescription],
    ['Gender', new GenderDescription],
    ['GGRank', new GGRankDescription],
    ['GunTime', new GunTimeDescription],
    ['ChipTime', new LastChipTimeDescription],
    ['FinishTime', new FinishTimeDescription],
    ['Rhythm', new RhythmDescription],
    ['Category', new CategoryDescription],
    ['CategoryRank', new CategoryRankDescription],
    ['Team', new TeamDescription],
    ['Attribute01', new CustomAttributeDescription(1)],
    ['Attribute02', new CustomAttributeDescription(2)],
    ['Attribute03', new CustomAttributeDescription(3)],
    ['Attribute04', new CustomAttributeDescription(4)],
    ['Attribute05', new CustomAttributeDescription(5)]
  ]);    
}

@Injectable()
export class ResultsService extends ProtectedRouteService {
  static readonly apiUrl = './api/results/';

  constructor(private http: HttpClient, private loginService: LoginService) {
    super(loginService);
  }

  /**
   * Gets the splits times of a race.
   *
   * @param {number} eventId  The id of the event
   * @param {number} raceId  The id of the race
   * @returns A promise of the splits times
   */
  public getResults(eventId: number, raceId: number): Promise<any[]> {
    return this.http.get(ResultsService.apiUrl + eventId + '/' + raceId)
      .toPromise()
      .then(results => results != null ? results[0] : null)
      .catch(ResultsService.handleError);
  }

  /**
   * Gets the results of a race.
   *
   * @param {number} eventId  The id of the event
   * @param {number} raceId  The id of the race
   * @returns A promise of the race results
   */
  public getPublicResults(eventId: number, raceId: number): Promise<any[]> {
    return this.http.get(ResultsService.apiUrl + "public/" + + eventId + '/' + raceId)
      .toPromise()
      .then(results => results != null ? results[0] : null)
      .catch(ResultsService.handleError);
  }

}
