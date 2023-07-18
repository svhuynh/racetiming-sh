import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import {
  FieldDescription,
  FirstNameDescription,
  LastNameDescription,
  RegistrationDateDescription,
  BirthDateDescription,
  AgeDescription,
  EmailDescription,
  PostalCodeDescription,
  StatusDescription,
  PhoneDescription,
  TeamDescription,
  BibNoDescription,
  CustomAttributeDescription,
  PlaceDescription,
  GenderDescriptionComboBox
} from './field-description';
import { LoginService } from './login.service';
import { ProtectedRouteService } from './protected-route.service';

export class Participant {
  id: number;
  Id: number;
  FirstName: string;
  LastName: string;
  Gender: number;
  BirthDate: Date;
  Age: number;
  Email: string;
  PostalCode: string;
  Statut: string;
  RegistrationDate: Date;
  Phone: string;
  Team: string;
  BibNo: number;
  Attribute01: string;
  Attribute02: string;
  Attribute03: string;
  Attribute04: string;
  Attribute05: string;
  Place: string;
  
  constructor(participant:Participant = null) {
    this.Id= 0;
    this.FirstName= "";
    this.LastName= "";
    this.Gender= NaN;
    this.BirthDate= null;
    this.Age= NaN;
    this.Email= "";
    this.PostalCode= "";
    this.Statut= "";
    this.RegistrationDate= null;  
    this.Phone= "";
    this.Team= "";
    this.BibNo= NaN;
    this.Attribute01= "";
    this.Attribute02= "";
    this.Attribute03= "";
    this.Attribute04= "";
    this.Attribute05= "";
    this.Place= "";

    if (participant) {
      for (var property in participant) {
        this[property] = participant[property];
      }
    }
  }

  static fieldsDescription: Map<string, FieldDescription> = new Map([
    ['BibNo', new BibNoDescription],
    ['FirstName', new FirstNameDescription],
    ['LastName', new LastNameDescription],
    ['Gender', new GenderDescriptionComboBox],
    ['BirthDate', new BirthDateDescription],
    ['Age', new AgeDescription],
    ['Team', new TeamDescription],
    ['Email', new EmailDescription],
    ['PostalCode', new PostalCodeDescription],
    ['Statut', new StatusDescription],
    ['RegistrationDate', new RegistrationDateDescription],
    ['Phone', new PhoneDescription],
    ['Place', new PlaceDescription],
    ['Attribute01', new CustomAttributeDescription(1)],
    ['Attribute02', new CustomAttributeDescription(2)],
    ['Attribute03', new CustomAttributeDescription(3)],
    ['Attribute04', new CustomAttributeDescription(4)],
    ['Attribute05', new CustomAttributeDescription(5)],
  ]);
};

@Injectable()
export class ParticipantsService extends ProtectedRouteService {
  static readonly apiUrl = './api/participants/';

  constructor(private http: HttpClient, private loginService: LoginService) {
    super(loginService);
  }

  /**
   * Gets the participants of a race.
   *
   * @param {number} eventId  The id of the event
   * @param {number} raceId  The id of the race
   * @returns A promise of the participants array
   */
  public getParticipants(eventId: number, raceId: number): Promise<Participant[]> {
    return this.http.get(ParticipantsService.apiUrl + eventId + '/' + raceId, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then(participants => Array.from(participants[0], participant => new Participant(participant as Participant)))
      .catch(ParticipantsService.handleError);
  }

  /**
   * Gets the number of participants in a race.
   *
   * @param {number} eventId  The id of the event
   * @param {number} raceId  The id of the race
   * @returns A promise of the participants count
   */
  public getParticipantsCount(eventId: number, raceId: number): Promise<number> {
    return this.http.get(ParticipantsService.apiUrl + 'count/' + eventId + '/' + raceId, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then(count => count as number)
      .catch(ParticipantsService.handleError);
  }

  /**
   * Deletes a participant from a race.
   *
   * @param {number} eventId  The id of the event
   * @param {number} raceId  The id of the race
   * @param {number} participantId  The id of the participant to delete
   * @returns An empty promise
   */
  public deleteParticipant(eventId: number, raceId: number, participantId: number) {
    return this.http.delete(ParticipantsService.apiUrl + eventId + '/' + raceId + '/' + participantId, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then()
      .catch(ParticipantsService.handleError);
  }

  /**
   * Deletes all the participants of a race.
   *
   * @param {number} eventId  The id of the event
   * @param {number} raceId  The id of the race
   * @returns An empty promise
   */
  public deleteParticipants(eventId: number, raceId: number): Promise<any> {
    return this.http.delete(ParticipantsService.apiUrl + eventId + '/' + raceId, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then()
      .catch(ParticipantsService.handleError);
  }

  /**
   * Updates a participant in a race.
   *
   * @param {number} eventId  The id of the event
   * @param {number} raceId  The id of the race
   * @param {number} participantId  The id of the participant to update
   * @param {any} participant  The new participant
   * @returns An empty promise
   */
  public updateParticipant(eventId: number, raceId: number, participantId: number, participant: any): Promise<any> {
    return this.http.put(ParticipantsService.apiUrl + eventId + '/' + raceId + '/' + participantId, participant, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then()
      .catch(ParticipantsService.handleError);
  }

  /**
   * Creates a participant in a race.
   *
   * @param {number} eventId  The id of the event
   * @param {number} raceId  The id of the race
   * @param {any} participant  The new participant
   * @returns An empty promise
   */
  public addParticipant(eventId: number, raceId: number, participant: any): Promise<any> {
    return this.http.post(ParticipantsService.apiUrl + eventId + '/' + raceId, participant, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then()
      .catch(ParticipantsService.handleError);
  }
}
