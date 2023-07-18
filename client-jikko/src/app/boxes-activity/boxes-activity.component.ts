import { Component, OnInit, Input } from '@angular/core';
import { BoxesService, Box } from '../boxes.service';
import { ColorSchemeService } from '../color-scheme.service';
import { ActivatedRoute } from '@angular/router';
import { RacesService } from '../races.service';
import { Observable } from 'rxjs/Rx';
import { ConfigurationComponent } from '../configuration/configuration.component';

@Component({
  selector: 'app-boxes-activity',
  templateUrl: './boxes-activity.component.html',
  styleUrls: ['./boxes-activity.component.css']
})
export class BoxesActivityComponent implements OnInit {
  private static readonly BOX_OPACITY_NEUTRAL: number = 0.55;
  public allBoxes: any[] = [];
  public areBoxesLoading: boolean = true;
  public raceId: number = 0;
  public eventId: number;

  @Input() set selectedRace(selectedRace: any) {
    if(selectedRace != null) {
      this.raceId = selectedRace.Id;
      this.loadBoxes();
    }
  }

  constructor(private boxesService: BoxesService,
              private colorSchemeService: ColorSchemeService,
              private route: ActivatedRoute,
              private racesService: RacesService) {
    this.eventId = parseInt(this.route.snapshot.paramMap.get('eventId'));
  }

  ngOnInit() {
  }

  private loadBoxes() {
    this.racesService.getDisposition(this.eventId, this.raceId)
      .then(disposition => {
        disposition = this.convertDisposition(disposition);
        this.allBoxes = [];
        
        disposition.forEach(dispositionBox => {
          if (this.allBoxes.find(box => box.Id === dispositionBox.Id) == null) {
            this.allBoxes.push(dispositionBox);
          }
        });
        this.areBoxesLoading = false;
        this.colorSchemeService.colorBoxes(this.allBoxes);
      });
  }

  private convertDisposition(disposition: any): any[] {
    let newDisposition = [];
    disposition.forEach(dispositionBox => {
      newDisposition.push({Name: dispositionBox.BoxName, Id: dispositionBox.BoxNo})
    });
    return newDisposition;
  }
}
