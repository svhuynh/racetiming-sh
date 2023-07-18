import { Injectable } from '@angular/core';
import { Role } from './login-data';

@Injectable()
export class SideNavService {
  private static eventId: number = 0;
  private static eventName: string = '';
  private static isVisible: boolean = true;
  private static role: Role = null;

  constructor() {
    if (typeof(Storage) !== "undefined") {
      // Load event from local storage
      if (localStorage.currentEventId != null && localStorage.currentEventId !== '' && localStorage.currentEventName != null && localStorage.currentEventName !== '') {
        SideNavService.eventId = +localStorage.currentEventId;
        SideNavService.eventName = localStorage.currentEventName;
      }
      // Load role from local storage
      if (localStorage.role != null && localStorage.role !== '') {
        SideNavService.role = new Role(JSON.parse(localStorage.role));
        SideNavService.isVisible = SideNavService.role.eventId <= 0;
      }
    } else {
      SideNavService.eventId = 0;
      SideNavService.eventName = '';
    }
  }

  /**
   * Gets the id of the event shown in the side nav.
   *
   * @returns The id of the event shown in the side nav
   */
  public static getEventId(): number {
    return SideNavService.eventId;
  }

  /**
   * Gets the name of the event shown in the side nav.
   *
   * @returns The name of the event shown in the side nav
   */
  public static getEventName(): string {
    return SideNavService.eventName;
  }

  /**
   * Updates the event shown in the side nav.
   *
   * @param {number} eventId  The id of the event
   * @param {string} eventName  The name of the event
   */
  public static updateCurrentEvent(eventId: number, eventName: string) {
    SideNavService.eventId = eventId;
    SideNavService.eventName = eventName;

    localStorage.currentEventId = eventId;
    localStorage.currentEventName = eventName;
  }

  private showNavBar() {
    SideNavService.isVisible = true;
  }

  private hideNavBar() {
    SideNavService.isVisible = false;
  }

  /**
   * Gets visibility of the side nav.
   *
   * @returns The visibility of the side nav
   */
  public getSideNavVisibility(): boolean {
    return SideNavService.isVisible;
  }

  /**
   * Sets the role of the side nav. Changes the visibility of the side nav according to the role.
   *
   * @param {Role} role  The new role of the side nav
   */
  public setRole(role: Role) {
    SideNavService.role = role;
    if (SideNavService.role != null) {
      if (SideNavService.role.eventId > 0) {
        this.hideNavBar();
      } else {
        this.showNavBar();
      }
    }
  }

  /**
   * Gets the role name shown on the side nav.
   *
   * @returns The role name shown on the side nav
   */
  public getRoleName(): string {
    return SideNavService.role != null ? SideNavService.role.name : '';
  }

  /**
   * Removes the event saved in the side nav.
   */
  public resetStoredEvent(): void  {
    localStorage.currentEventId = '';
    localStorage.currentEventName = '';
    SideNavService.eventId = 0;
    SideNavService.eventName = '';
  }

  /**
   * Removes all the data saved in the side nav.
   */
  public resetAllStoredData(): void {
    this.resetStoredEvent();
    SideNavService.role = null;
  }
}
