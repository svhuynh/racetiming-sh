import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { EventsService } from '../events.service';
import { RacesService } from '../races.service';
import { ResultsService, PublicResults } from '../results.service';
import { ActivatedRoute } from '@angular/router';
import { DataTableComponent } from '../data-table/data-table.component';
import { RhythmDescription } from '../field-description';
import { ReportsService, Ranking } from '../reports.service';
import { SnackBarService, MessageType } from '../snack-bar.service';

@Component({
  selector: 'app-public-results',
  templateUrl: './public-results.component.html',
  styleUrls: ['./public-results.component.css']
})
export class PublicResultsComponent implements OnInit {

  @ViewChildren(DataTableComponent) dataTables: QueryList<DataTableComponent>;

  public fieldsDescription: any;
  public eventId: number;
  public event: any;
  public eventRaces: any[] = [];
  public areResultsLoading: boolean;

  constructor(private eventsService: EventsService,
              private racesService: RacesService,
              private resultsService: ResultsService,
              private route: ActivatedRoute,
              private reportsService: ReportsService,
              private snackBarService: SnackBarService) { 
  }

  ngOnInit() {
    this.areResultsLoading = true;
    this.eventId = parseInt(this.route.snapshot.paramMap.get('eventId'));
    this.eventsService.getEvent(this.eventId).then(event => {
      this.event = event;
    }).catch(error => {
      console.error(error);
    });

    let racesResults: Map<any, any[]> = new Map();

    this.racesService.getRaces(this.eventId).then(races => {
      this.eventRaces = races;
      this.dataTables.forEach(dataTable => {
        //console.log(dataTable);
        dataTable.sortItems('OGRank');
      });
      let resultsPromises: Promise<any[]>[] = [];

      this.eventRaces.forEach(race => {
        race.fieldsDescription = PublicResults.fieldsDescription;
        let unit = '';
        switch(+race.Discipline) {
          case 1:
            unit = 'min/km';
            break;
          case 2:
            unit = 'km/h';
            break;
          case 3:
            unit = 'sec/100m';
            break;
          case 4:
            unit = 'm/min';
            break;
          default:
            unit = 'Invalid';
            break;
        }
        race.fieldsDescription.set("Rhythm", new RhythmDescription(unit))
        
        let resultPromise = this.resultsService.getPublicResults(this.eventId, race.Id)
          .then(raceResults => {
            racesResults.set(race, raceResults);
            return undefined;
          });
        resultsPromises.push(resultPromise);
      });

      Promise.all(resultsPromises)
        .then(() => {
          racesResults.forEach((raceResults, race) => {
            // Parse rankings
            let rankings: Ranking[] = [];
            try {
              let parsedRankings = JSON.parse(race.ReportsCriteria);
              rankings = parsedRankings != null ? Array.from(parsedRankings, parsedRanking => new Ranking(parsedRanking)) : [];
            } catch(e) {
                console.error("Invalid rankings JSON");
            }
            
            race.publicResults = raceResults;
            // Generate ranking columns
            race.publicResults.forEach(result => {
              result.Category = this.reportsService.resultCategoryName(result, rankings);
              result.CategoryRank = this.reportsService.resultCategoryRank(result, rankings, raceResults);
            });
          });

          this.dataTables.forEach(dataTable => {
            dataTable.sortItems('OGRank');
          });
        }).catch(error => {
          this.snackBarService.open("Erreur lors du chargement des résultats", MessageType.Error);
          console.error(error);
        }).then(() => {
          this.areResultsLoading = false;
        });
    }).catch(error => {
      this.snackBarService.open("Erreur lors du chargement des épreuves", MessageType.Error);
      console.error(error);
    });
  }

  public isThereAnyResult(race: any): boolean {
    return !this.areResultsLoading &&
            race != null &&
            race.publicResults != null &&
            race.publicResults.length > 0;
  }
}
