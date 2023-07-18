import { Injectable } from '@angular/core';
import { FieldDescription, AgeDescription, GenderDescription, CustomAttributeDescription } from './field-description';
import { ResultsService } from './results.service';
import { RacesService } from './races.service';
import { race } from 'rxjs/operator/race';

import * as XLSX from 'xlsx';
import { EventsService } from './events.service';
import { SnackBarService, MessageType } from './snack-bar.service';

const EXCEL_EXTENSION = '.xlsx';

export enum TimingType {
  ChipTime,
  GunTime
}

export enum Gender {
  Male = 0,
  Female = 1,
  Any = 2
}

export enum AgeComparator {
  SmallerOrEqual,
  BiggerOrEqual,
  Between,
  Any
}

export class Ranking {
  name: string = '';
  timingType: TimingType = TimingType.GunTime;
  ageMin: number = null;
  ageMax: number = null;
  ageValue: number = null;
  ageComparator: AgeComparator = AgeComparator.Between;
  genderValue: Gender = Gender.Any;

  constructor(ranking: any = null) {
    if (ranking != null) {
      this.timingType = ranking.timingType;
      this.ageMin = ranking.ageMin;
      this.ageMax = ranking.ageMax;
      this.ageValue = ranking.ageValue;
      this.ageComparator = ranking.ageComparator;
      this.genderValue = ranking.genderValue;
    }
    this.updateName();
  }

  get shortName(): string {
    return this.generateAgeGroupName();
  }

  public updateName() {
    let nameElements = [];

    // Gender
    if (this.genderValue === Gender.Male) {
      nameElements.push('Hommes');
    } else if (this.genderValue === Gender.Female) {
      nameElements.push('Femmes');
    } else if (this.genderValue === Gender.Any) {
      nameElements.push('Tous');
    }

    // Age
    let ageGroupName = this.generateAgeGroupName();
    if (ageGroupName.length > 0) {
      nameElements.push(ageGroupName);
    }

    this.name = nameElements.join(', ')
    if (this.name.length > 0) {
      this.name += ', ';
    }
    this.name += this.timingType === TimingType.GunTime ? 'Gun' : 'Puce';
  }

  private generateAgeGroupName(): string {
    if (this.ageComparator === AgeComparator.BiggerOrEqual && this.ageValue != null) {
      return this.ageValue + ' et +';
    } else if (this.ageComparator === AgeComparator.SmallerOrEqual && this.ageValue != null) {
      return this.ageValue + ' et -';
    } else if (this.ageComparator === AgeComparator.Between && this.ageMin != null && this.ageMax != null) {
      return this.ageMin + ' - ' + this.ageMax + ' ans';
    }
    return '';
  }
}

@Injectable()
export class ReportsService {
  public static readonly PTIT_TRAIN_AGE_GROUPS: number[][] = [
    [29],
    [30, 39],
    [40, 49],
    [50, 59],
    [60]
  ];
  public static readonly VERSANTS_AGE_GROUPS: number[][] = [
    [16, 29],
    [30, 44],
    [45]
  ];
  public static readonly BOREAL_AGE_GROUPS: number[][] = [
    [15],
    [16, 19],
    [20, 29],
    [30, 39],
    [40, 49],
    [50, 59],
    [60, 69],
    [70, 79],
    [80]
  ];
  public static readonly BOSTON_AGE_GROUPS: number[][] = [
    [18, 34],
    [35, 39],
    [40, 44],
    [45, 49],
    [50, 54],
    [55, 59],
    [60, 64],
    [65, 69],
    [70, 74],
    [75, 79],
    [80]
  ];
  public static readonly CHICAGO_AGE_GROUPS: number[][] = [
    [16, 19],
    [20, 24],
    [25, 29],
    [30, 34],
    [35, 39],
    [40, 44],
    [45, 49],
    [50, 54],
    [55, 59],
    [60, 64],
    [65, 69],
    [70, 74],
    [75, 79],
    [80]
  ];
  public static readonly NEW_YORK_AGE_GROUPS: number[][] = [
    [18, 19],
    [20, 24],
    [25, 29],
    [30, 34],
    [35, 39],
    [40, 44],
    [45, 49],
    [50, 54],
    [55, 59],
    [60, 64],
    [65, 69],
    [70, 74],
    [75, 79],
    [80, 89]
  ];

  constructor(private resultsService: ResultsService, private racesService: RacesService,
    private eventsService: EventsService, private snackBarService: SnackBarService) { }

  private generateRanking(ranking: Ranking, raceResults: any[]) {
    raceResults = raceResults.filter(result => {
      if (result == null) return false;
      
      // Filter results without time
      if (ranking.timingType === TimingType.ChipTime) {
        if (result.ChipTime == null || result.ChipTime === "00h00m00s") return false;
      } else if (ranking.timingType === TimingType.GunTime) {
        if (result.GunTime == null || result.GunTime === "00h00m00s") return false;
      }
      
      // Filter results not matching criteria
      return this.isResultInCategory(result, ranking);
    });

    // Sort results
    raceResults.sort((a, b) => {
      if (ranking.timingType === TimingType.ChipTime) {
        return a.ChipTime < b.ChipTime ? -1 : 1;
      } else if (ranking.timingType === TimingType.GunTime) {
        return a.GunTime < b.GunTime ? -1 : 1;
      }
    });
    return raceResults;
  }

  private isResultInCategory(result: any, ranking: Ranking) {
    if (ranking.genderValue !== Gender.Any && result.Gender !== ranking.genderValue) return false;

    if (ranking.ageComparator === AgeComparator.BiggerOrEqual && ranking.ageValue != null) {
      if (result.Age == null || result.Age < ranking.ageValue) return false;
    } else if (ranking.ageComparator === AgeComparator.SmallerOrEqual && ranking.ageValue != null) {
      if (result.Age == null || result.Age > ranking.ageValue) return false;
    } else if (ranking.ageComparator === AgeComparator.Between && ranking.ageMin != null && ranking.ageMax != null) {
      if (result.Age == null || result.Age < ranking.ageMin || result.Age > ranking.ageMax) return false;
    }
    return true;
  }

  /**
   * Finds the category name of the given result.
   *
   * @param {any} result  The race result
   * @param {Ranking[]} rankings  All the categories of the race
   * @returns The category name
   */
  public resultCategoryName(result: any, rankings: Ranking[]): string {
    let categoryName = '';
    rankings.forEach(ranking => {
      if (this.isResultInCategory(result, ranking)) {
        categoryName = ranking.shortName;
      }
    });
    return categoryName;
  }

  /**
   * Finds the category rank of the given result.
   *
   * @param {any} result  The race result
   * @param {Ranking[]} rankings  All the categories of the race
   * @returns The category rank
   */
  public resultCategoryRank(result: any, rankings: Ranking[], raceResults: any[]): number {
    let categoryRanking = 0;
    rankings.forEach(ranking => {
      if (this.isResultInCategory(result, ranking)) {
        let rankingResults = this.generateRanking(ranking, raceResults);
        categoryRanking = rankingResults.indexOf(result) + 1;
      }
    });
    if (categoryRanking === 0) {
      categoryRanking = null;
    }
    return categoryRanking;
  }
}
