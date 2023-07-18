import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginService } from './login.service';
import { ProtectedRouteService } from './protected-route.service';

@Injectable()
export class RacesService extends ProtectedRouteService {
  static readonly apiUrl = './api/races/';

  constructor(private http: HttpClient, private loginService: LoginService) {
    super(loginService);
  }

  /**
   * Gets the races of an event.
   *
   * @param {number} eventId  The id of the event
   * @returns A promise of the races array
   */
  public getRaces(eventId: number) {
    return this.http.get(RacesService.apiUrl + eventId, {headers:
       new HttpHeaders().set('x-access-token', localStorage.token)
      })
      .toPromise()
      .then(data => data[0] as any[])
      .catch(RacesService.handleError);
  }

  /**
   * Gets the race associated with an event id and race id.
   *
   * @param {number} eventId  The id of the event
   * @param {number} raceId  The id of the race
   * @returns A promise of the race
   */
  public getRace(eventId: number, raceId: number) {
    return this.http.get(RacesService.apiUrl + eventId + '/' + raceId, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then(data => data[0][0] as any[])
      .catch(RacesService.handleError);
  }

  /**
   * Updates the race associated with an event id and race id.
   *
   * @param {number} eventId  The id of the event
   * @param {number} raceId  The id of the race
   * @param {any} race  The new race
   * @returns An empty promise
   */
  public updateRace(eventId: number, raceId: number, race: any) {
    return this.http.put(RacesService.apiUrl + eventId + '/' + raceId, race, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then()
      .catch(RacesService.handleError);
  }

  /**
   * Deletes the race associated with an event id and race id.
   *
   * @param {number} eventId  The id of the event
   * @param {number} raceId  The id of the race
   * @returns An empty promise
   */
  public deleteRace(eventId: number, raceId: number) {
    return this.http.delete(RacesService.apiUrl + eventId + '/' + raceId, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then()
      .catch(RacesService.handleError);
  }

  /**
   * Deletes all the races of an event.
   *
   * @param {number} eventId  The id of the event
   * @returns An empty promise
   */
  public deleteRaces(eventId: number) {
    return this.http.delete(RacesService.apiUrl + eventId, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then()
      .catch(RacesService.handleError);
  }

  /**
   * Creates a new race in an event.
   *
   * @param {number} eventId  The id of the event
   * @param {any} race  The new race
   * @returns An empty promise
   */
  public addRace(eventId: number, race: any) {
    return this.http.post(RacesService.apiUrl + eventId, race, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then()
      .catch(RacesService.handleError);
  }

  /**
   * Gets the boxes disposition of a race.
   *
   * @param {number} eventId  The id of the event
   * @param {number} raceId  The id of the race
   * @returns A promise of the boxes array
   */
  public getDisposition(eventId: number, raceId: number) {
    return this.http.get(RacesService.apiUrl + 'disposition/' + eventId + '/' + raceId, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then(data => data[0] as any[])
      .catch(RacesService.handleError);
  }

  /**
   * Generates a simplified array from a race nestable list to removing the loops and 
   * changing the relative distances to absolute distances.
   *
   * @param {number} nestableList  The nestable list to convert
   * @returns The simplified boxes array
   */
  public generateSimplifiedBoxes(nestableList: any[]): any[] {
    let simplifiedBoxes = [];
    let position: number = 0;

    nestableList.forEach(item => {
      if (item.type === "box") {
        // Box: simply add distance
        position += item.distance;
        simplifiedBoxes.push({Id: item.Id, name: item.name, pos: position, color: item.color, nestableListId: item.nestableListId});
      }
      else if (item.type === "loop") {
        // Loop: iterate through children
        for (let i = 0; i < item.laps; i++) {
          item.children.forEach(child => {
            position += child.distance;
            simplifiedBoxes.push({Id: child.Id, name: child.name, pos: position, color: child.color, nestableListId: child.nestableListId});
          });
        }
      }
    });
    return simplifiedBoxes;
  }

  /**
   * Regenerates the filtered times of a race using the existing raw times.
   * This should be called after changing critical race information (start time,
   * max speed, disposition).
   *
   * @param {number} eventId  The id of the event
   * @param {number} raceId  The id of the race
   * @returns An empty promise
   */
  public regenerateFilteredTimes(eventId: number, raceId: number) {
    return this.http.get(RacesService.apiUrl + 'generate/' + eventId + '/' + raceId, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then()
      .catch(RacesService.handleError);
  }

  /**
   * Gets raw times of a race associated with a bib number.
   *
   * @param {number} eventId  The id of the event
   * @param {number} raceId  The id of the race
   * @param {number} bibNo  The bib number
   * @returns A promise of the raw times array
   */
  public getRawTimes(eventId: number, raceId: number, bibNo: number){
    return this.http.get(RacesService.apiUrl + 'rawtimes/' + eventId + '/' + raceId + '/' + bibNo, {
      headers:
        new HttpHeaders().set('x-access-token', localStorage.token)
    })
      .toPromise()
      .then(data => data as any[])
      .catch(RacesService.handleError);
  }
}
