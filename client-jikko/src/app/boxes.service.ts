import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { FieldDescription,
  BoxNameDescription,
  BoxIpDescription
} from './field-description';
import { ProtectedRouteService } from './protected-route.service';
import { LoginService } from './login.service';

export class Box {
  Id: number;
  Name: string;
  ReaderIp: string;
  color?: string;

  static fieldsDescription: Map<string, FieldDescription> = new Map([
    ['Name', new BoxNameDescription],
    ['ReaderIp', new BoxIpDescription]
  ]);    
}

@Injectable()
export class BoxesService extends ProtectedRouteService {

  static readonly apiUrl = './api/boxes/';

  constructor(private http: HttpClient, private loginService: LoginService) {
    super(loginService);
  }

  /**
   * Gets all existing boxes.
   *
   * @returns A promise of the boxes array
   */
  public getBoxes() {
    return this.http.get(BoxesService.apiUrl, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then(data => data[0] as any[])
      .catch(BoxesService.handleError);
  }

  /**
   * Deletes a box.
   *
   * @param {number} boxId  The id of the box to delete
   * @returns An empty promise
   */
  public deleteBox(boxId: number) {
    return this.http.delete(BoxesService.apiUrl + boxId, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then()
      .catch(BoxesService.handleError);
  }

  /**
   * Creates a box.
   *
   * @param {Box} box  The box to create
   * @returns An empty promise
   */
  public addBox(box: Box) {
    return this.http.post(BoxesService.apiUrl, box, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then()
      .catch(BoxesService.handleError);
  }

  /**
   * Updates an existing box.
   *
   * @param {Box} box  The new box with an existing box id
   * @returns An empty promise
   */
  public updateBox(box: Box) {
    return this.http.put(BoxesService.apiUrl, box, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then()
      .catch(BoxesService.handleError);
  }

  /**
   * Gets all the boxes used in an event.
   *
   * @param {number} eventId  The id of the event
   * @returns A promise of the boxes array
   */
  public getEventBoxList(eventId: number) {
    return this.http.get(BoxesService.apiUrl + eventId, {headers:
      new HttpHeaders().set('x-access-token', localStorage.token)
     })
      .toPromise()
      .then(data => data[0] as any[])
      .catch(BoxesService.handleError);
  }

}
