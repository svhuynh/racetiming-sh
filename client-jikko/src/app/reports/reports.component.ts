import { Component, OnInit } from '@angular/core';
import { RacesService } from '../races.service';
import { ActivatedRoute } from '@angular/router';
import { ReportsService, Ranking, AgeComparator, Gender, TimingType } from '../reports.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  public eventId: number = 0;
  public timingType = TimingType;
  public rankings: Ranking[] = [];
  public ageComparator = AgeComparator;
  public gender = Gender;

  constructor(private racesService: RacesService,
              private route: ActivatedRoute,
              private reportsService: ReportsService) {
    this.eventId = parseInt(this.route.snapshot.paramMap.get('eventId'));
  }

  ngOnInit() {
  }

  public onAddRanking(): void {
    this.rankings.push(new Ranking);
  }

  public onRemoveRanking(ranking: Ranking): void {
    let index = this.rankings.indexOf(ranking);
    if (index >= 0) {
      this.rankings.splice(index, 1);
    }
  }

  public onDeleteAll() {
    this.rankings = [];
  }

  public onPredefinedBoston(): void {
    this.rankings.push(...this.createRankingsFromAgeGroups(ReportsService.BOSTON_AGE_GROUPS));
  }

  public onPredefinedChicago(): void {
    this.rankings.push(...this.createRankingsFromAgeGroups(ReportsService.CHICAGO_AGE_GROUPS));
  }

  public onPredefinedNewYork(): void {
    this.rankings.push(...this.createRankingsFromAgeGroups(ReportsService.NEW_YORK_AGE_GROUPS));
  }

  public onPredefinedBoreal(): void {
    this.rankings.push(...this.createRankingsFromAgeGroups(ReportsService.BOREAL_AGE_GROUPS));
  }

  public onPredefinedVersants(): void {
    this.rankings.push(...this.createRankingsFromAgeGroups(ReportsService.VERSANTS_AGE_GROUPS));
  }

  public onPredefinedPtitTrain(): void {
    this.rankings.push(...this.createRankingsFromAgeGroups(ReportsService.PTIT_TRAIN_AGE_GROUPS));
  }

  private createRankingsFromAgeGroups(ageGroups: number[][]): Ranking[] {
    let rankings: Ranking[] = [];
    let isFirst: boolean = true;
    ageGroups.forEach(ageGroup => {
      rankings.push(...this.createRankingsFromAgeGroup(ageGroup, isFirst));
      isFirst = false;
    });

    return rankings;
  }

  private createRankingsFromAgeGroup(ageGroup: number[], isMin: boolean = false): Ranking[] {
    let rankings: Ranking[] = [];

    let menRanking: Ranking = new Ranking;
    menRanking.genderValue = Gender.Male;
    this.setAgeGroup(menRanking, ageGroup, isMin);
    menRanking.updateName();

    let womenRanking: Ranking = new Ranking;
    womenRanking.genderValue = Gender.Female;
    this.setAgeGroup(womenRanking, ageGroup, isMin);
    womenRanking.updateName();

    return [menRanking, womenRanking];
  }
  
  private setAgeGroup(ranking: Ranking, ageGroup: number[], isMin): void {
    if (ageGroup.length > 1) {
      ranking.ageComparator = AgeComparator.Between;
      ranking.ageMin = ageGroup[0];
      ranking.ageMax = ageGroup[1];
    } else if (isMin) {
      ranking.ageComparator = AgeComparator.SmallerOrEqual;
      ranking.ageValue = ageGroup[0];
    } else {
      ranking.ageComparator = AgeComparator.BiggerOrEqual;
      ranking.ageValue = ageGroup[0];
    }
  }

  public getRankings(): Ranking[] {
    return this.rankings;
  }

  public setRankings(rankings: Ranking[]): void  {
    this.rankings = rankings != null ? rankings : [];
  }
}
