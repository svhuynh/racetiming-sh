import { Component, OnInit, Inject } from '@angular/core';
import { EventsService } from '../events.service';
import { RacesService } from '../races.service';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { all } from 'q';

@Component({
  selector: 'app-duplicate-race',
  templateUrl: './duplicate-race.component.html',
  styleUrls: ['./duplicate-race.component.css']
})
export class DuplicateRaceComponent implements OnInit {

  public allEvents: any;

  constructor(
    private eventsService: EventsService,
    private racesService: RacesService,
    public dialogRef: MatDialogRef<DuplicateRaceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {

    this.eventsService.getEvents()
    .then(events => {

      this.allEvents = events;

      this.allEvents = this.allEvents.filter(event => event.RaceCount > 0);

      this.getRaces(this.allEvents);

    })
    .catch(error => console.error(error))
  }

  getRaces(events: any) {
    events.forEach(event => {
      this.racesService.getRaces(event.Id)
      .then(races => {
        event.races = races
      })
      .catch(error => {
        console.error(error);
      });
    });
  }

  addRaceToDuplicate(e: any, eventId: number, raceId: number )
  {

    let race = {"eventId": eventId, "raceId": raceId};

    if(e.selected)
    {
      this.data.push(race);
    }
    else
    {
      for (var i = 0; i < this.data.length; i++)
      {
        if (this.data[i].eventId === race.eventId && this.data[i].raceId === race.raceId) 
        {
          this.data.splice(i,1);
            break;
        }
      }

    }

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
