import { Component } from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import {ChangeDetectorRef} from '@angular/core';
import { SideNavService } from './side-nav.service'
import { LoginService } from './login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventsService } from './events.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  constructor(public sideNavService: SideNavService,
              private loginService: LoginService,
              private route: ActivatedRoute,
              private router: Router,
              private eventsService: EventsService) {}

  ngOnInit() {
    /*this.router.events.subscribe((event) => {
        console.log(event);
    });*/
  }

  getCurrentEventName() {
    return SideNavService.getEventName();
  }

  getCurrentEventId() {
    return SideNavService.getEventId();
  }

  logout() {
    this.loginService.logout();
  }

  getSideNavVisibility(): boolean {
    return this.sideNavService.getSideNavVisibility();
  }

  getRoleName(): string {
    return this.sideNavService.getRoleName();
  }

  onRouterActivate(component) {
    // Update side nav stored event
    if (component != null && component.route != null) {
      let eventId: number = parseInt(component.route.snapshot.paramMap.get('eventId'));
      if (!isNaN(eventId)) {
        this.eventsService.getEvent(eventId)
          .then(event => {
            if (event.Name != null && event.Name !== '') {
              SideNavService.updateCurrentEvent(eventId, event.Name);
            }
          }).catch(error => console.error(error));
      }
    }
    //console.log(component.route)
    //console.log(component.eventId);
    //console.log(this.route);
    //let eventId: number = parseInt(this.route.snapshot.paramMap.get('eventId'));
    //console.log(isNaN(eventId));
  }
}
