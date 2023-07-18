import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FilteredTime } from '../timing.service';
import { ParticipantsService, Participant } from '../participants.service';
import { RacesService } from '../races.service';
import { DataTableComponent } from '../data-table/data-table.component';
import { FieldDescription, FirstNameDescription, LastNameDescription, BibNoDescription } from '../field-description';
import { ActivatedRoute } from '@angular/router';
import { ResultsService } from '../results.service';

interface LooseObject {
  [key: string]: any
}

@Component({
  selector: 'app-participants-results',
  templateUrl: './participants-results.component.html',
  styleUrls: ['./participants-results.component.css']
})
export class ParticipantsResultsComponent implements OnInit {
  participantsResults: any[];
  fieldsDescription: Map<string, FieldDescription>;
  areParticipantsResultsLoading: boolean;
  raceId: number;
  eventId: number;
  @Input() set selectedRace(selectedRace: any) {
    this.raceId = selectedRace != null ? selectedRace.Id : 0;
    if (this.raceId != 0) {
      this.reloadParticipantsResults();
    }
  }
  @Input() set filteredTimes(filteredTimes: any[]) {
    this.reloadParticipantsResults();
  }
  @Output() fullScreenClick: EventEmitter<any> = new EventEmitter();
  @ViewChild(DataTableComponent) dataTable: DataTableComponent;

  constructor(private participantsService: ParticipantsService,
              private racesService: RacesService,
              private route: ActivatedRoute,
              private resultsService: ResultsService) {
    this.eventId = parseInt(this.route.snapshot.paramMap.get('eventId'));
    this.fieldsDescription = new Map([
      ['BibNo', new BibNoDescription],
      ['FirstName', new FirstNameDescription],
      ['LastName', new LastNameDescription]
    ]);
  }

  ngOnInit() {
    this.areParticipantsResultsLoading = false;
    this.participantsResults = [];
    this.dataTable.defaultSettings();
  }

  private reloadParticipantsResults() {
    this.resultsService.getResults(this.eventId, this.raceId)
      .then(results => {
        if (results != null && results[0] != null) {
          this.fieldsDescription = new Map([
            ['BibNo', new BibNoDescription],
            ['FirstName', new FirstNameDescription],
            ['LastName', new LastNameDescription]
          ]);
          let defaultFields = Array.from(this.fieldsDescription.keys())
          let fieldsDescription = new Map(this.fieldsDescription);
          Object.keys(results[0]).forEach(key => {
            // Set fields that are not already defined
            if (defaultFields.indexOf(key) < 0) {
              fieldsDescription.set(key, { displayName: 'Split: ' + +key/1000 + ' km', inputType: "text", pipe: 'time' });
            }
          });
          this.fieldsDescription = fieldsDescription;
          this.dataTable.setDataSource(results);
        } else {
          this.dataTable.setDataSource([]);
        }
      });
  }

  public onFullScreenClick() {
    this.fullScreenClick.emit();
  }
}