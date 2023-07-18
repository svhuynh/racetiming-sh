import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {PlatformLocation } from '@angular/common';
import { ReportsService, Ranking } from '../reports.service';
import { DownloadExcelFileComponent } from '../download-excel-file/download-excel-file.component';
import { ResultsService, PublicResults } from '../results.service';
import { FieldDescription } from '../field-description';
import { RacesService } from '../races.service';
import { MessageType, SnackBarService } from '../snack-bar.service';
import { EventsService } from '../events.service';

@Component({
  selector: 'app-results-options',
  templateUrl: './results-options.component.html',
  styleUrls: ['./results-options.component.css']
})
export class ResultsOptionsComponent implements OnInit {

  public eventId: number;
  public URL: string;
  public fieldsDescription: Map<string, FieldDescription> = PublicResults.fieldsDescription;
  private eventName: string = '';
  private racesNames: string[] = [];
  private racesResults: any[][] = [];

  @ViewChild(DownloadExcelFileComponent) excelFile: DownloadExcelFileComponent;

  constructor(private router: Router,
    private route: ActivatedRoute,
    platformLocation: PlatformLocation,
    private racesService: RacesService,
    private resultsService: ResultsService,
    private snackBarService: SnackBarService,
    private eventsService: EventsService,
    private reportsService: ReportsService) {
      this.URL = (platformLocation as any).location.origin;
     }

  ngOnInit() 
  {
    this.eventId = parseInt(this.route.snapshot.paramMap.get('eventId'));
    this.URL = this.URL + '/public-results/' + this.eventId;

    this.eventsService.getEvent(this.eventId)
      .then(event => {
        this.eventName = event.Name;
      }).catch(error => {
        this.snackBarService.open("Erreur lors du chargement de l'événement", MessageType.Error);
        console.error(error)
      });
    
    this.racesService.getRaces(this.eventId)
      .then(races => {
        races.forEach(race => {
          // Parse race rankings
          let parsedRankings = JSON.parse(race.ReportsCriteria);
          let rankings: Ranking[] = parsedRankings != null ? Array.from(parsedRankings, parsedRanking => new Ranking(parsedRanking)) : [];
          // Get race results
          this.resultsService.getPublicResults(this.eventId, race.Id)
            .then(results => {
              this.racesNames.push(race.Name);
              // Generate rankings columns
              results.forEach(result => {
                result.Category = this.reportsService.resultCategoryName(result, rankings);
                result.CategoryRank = this.reportsService.resultCategoryRank(result, rankings, results);
              });
              this.racesResults.push(results);
            }).catch(error => {
              this.snackBarService.open("Erreur lors du chargement des résultats", MessageType.Error);
              console.error(error)
            });
        });
      }).catch(error => {
        this.snackBarService.open("Erreur lors du chargement des épreuves", MessageType.Error);
        console.error(error);
      });
  }

  public downloadJSONToXLSX() {
    try {
      this.excelFile.exportAsExcelFileTabs(this.racesResults, this.racesNames, "Resultats_" + this.eventName);
    } catch(error) {
      this.snackBarService.open("Erreur lors du téléchargement des résultats", MessageType.Error);
      console.error(error);
    }
  }
}
