import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DndDropEvent, DropEffect } from "ngx-drag-drop";
import { RacesService } from '../races.service';
import { ConfigurationComponent } from '../configuration/configuration.component'
import { SnackBarService, MessageType } from '../snack-bar.service';
import { BoxesService, Box } from '../boxes.service';
import { ColorSchemeService } from '../color-scheme.service';
import { ReportsComponent } from '../reports/reports.component';
import { Ranking } from '../reports.service';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

import {WarningDialogComponent} from '../warning-dialog/warning-dialog.component';

interface NestableListItem {
  Id?: number;
  type: string;
  name: string;
  distance?: number;
  color?: string;
  laps?: number;
  children?: NestableListItem[];
  nestableListId?: number;
}

@Component({
  selector: 'app-race-editor',
  templateUrl: './race-editor.component.html',
  styleUrls: ['./race-editor.component.css']
})

export class RaceEditorComponent implements OnInit {

  private static readonly CARD_OPACITY_FOCUS = 0.75;
  private static readonly CARD_OPACITY_NEUTRAL = 0.55;
  private currentDraggableEvent: DragEvent;
  private currentDragEffectMsg: string;
  public raceTime: string;
  public raceDate: Date;
  public boxes: any[];
  public tools:NestableListItem[];
  public nestableList:NestableListItem[];
  private eventId: number;
  private raceId: number;
  public raceName: string;
  public raceDiscipline: number;
  public race: any;
  public areToolsLoading: boolean;
  public isRaceLoading: boolean;
  private availableBoxes: any[];
  public rankings: Ranking[] = null;
  public rhythm: number;

  public oldRhythm : number;
  public oldRaceTime: string;
  public oldNestableList: any[] = [];

  @ViewChild(ReportsComponent) reportsComponent: ReportsComponent;

  constructor(private racesService: RacesService,
              private route: ActivatedRoute,
              private router: Router,
              private boxesService: BoxesService,
              private snackBarService: SnackBarService,
              public dialog: MatDialog,
              private colorSchemeService: ColorSchemeService) { }

  ngOnInit() {
    this.eventId = parseInt(this.route.snapshot.paramMap.get('eventId'));
    this.raceId = parseInt(this.route.snapshot.paramMap.get('raceId'));
    this.raceDate = new Date();
    this.raceTime = "12:00:00";
    this.rhythm = 5;
    this.nestableList = [];
    this.boxes = [];
    this.tools = [];
    this.areToolsLoading = true;
    this.isRaceLoading = true;
    this.raceName = "";
    this.raceDiscipline = 1;


    this.boxesService.getBoxes().then(boxes => {
      this.availableBoxes = boxes;
      this.updateTools();

      if (this.raceId === 0) {
        this.onDispositionReady();
      }
      else
      {
        this.racesService.getRace(this.eventId, this.raceId).then((race) => {
          this.fillInputs(race);
          this.parseDisposition(race);
          this.parseRankings(race);
          this.onDispositionReady();
        }).catch(error => console.error(error));
      }
    }).catch(error => console.error(error))

  }

  private updateTools() {
    this.tools = [
      // The loop tool is harcoded
      {
        type: "loop",
        name: "Boucle",
        laps: 1
      }
    ];

    this.availableBoxes.forEach(box => {
      this.tools.push({
        Id: box.Id,
        name: box.Name,
        type: "box",
        distance: 1
      });
    });

    this.areToolsLoading = false;
  }

  private fillInputs(race: any) {
    this.raceDiscipline = race.Discipline === null ? 0 : +race.Discipline;

    this.rhythm = race.MaxRhythm;
    this.oldRhythm = race.MaxRhythm;

    if (this.raceDiscipline == 2) // km/h
    {
      this.rhythm = 60 / this.rhythm;
    }
    else if (this.raceDiscipline == 3) //sec/100s
    {
      this.rhythm = this.rhythm * 6;
    }
    else if (this.raceDiscipline == 4) // m/min
    {
      this.rhythm = 1000 / this.rhythm;
    }
    
    this.raceName = race.Name;
    this.raceDate = ConfigurationComponent.formatDateForInput(new Date(race.StartDate));
    this.raceTime = ConfigurationComponent.formatTimeForInput(new Date(race.StartDate));
    this.oldRaceTime = ConfigurationComponent.formatTimeForInput(new Date(race.StartDate));
  }

  private parseDisposition(race: any) {
    try {
      let parsedDisposition = JSON.parse(race.Disposition);
      this.convertDistancesMToKm(parsedDisposition);
      this.nestableList = parsedDisposition;
      
      // Add ids if they are not set
      this.nestableList.forEach(item => {
        if (item.type !== "loop") {
          if (item.nestableListId == null || !this.isNestableListIdUnique(item.nestableListId)) {
            item.nestableListId = this.findUniqueNestableListId();
          }
        } else {
          item.children.forEach(child => {
            if (child.nestableListId == null || !this.isNestableListIdUnique(child.nestableListId)) {
              child.nestableListId = this.findUniqueNestableListId();
            }
          });
        }
      });
      
      this.oldNestableList = this.copyWithoutColorsAndIds(this.nestableList);
    } catch(e) {
        console.error("Invalid boxes JSON");
    }
  }

  private copyWithoutColorsAndIds(nestableList: any[]): any[] {
    let listCopy = [];
    nestableList.forEach(item => {
      let itemCopy = Object.assign({}, item);
      if ('color' in itemCopy) {
        delete itemCopy.color;
      }
      if ('nestableListId' in itemCopy) {
        delete itemCopy.nestableListId;
      }
      if (itemCopy.type === "loop") {
        itemCopy.children = [];
        item.children.forEach(child => {
          let childCopy = Object.assign({}, child);
          if ('color' in childCopy) {
            delete childCopy.color;
          }
          if ('nestableListId' in childCopy) {
            delete childCopy.nestableListId;
          }
          itemCopy.children.push(childCopy);
        });
      }
      listCopy.push(itemCopy);
    });
    return listCopy;
  }

  private parseRankings(race: any) {
    try {
      let parsedRankings = JSON.parse(race.ReportsCriteria);
      let rankings: Ranking[] = parsedRankings != null ? Array.from(parsedRankings, parsedRanking => new Ranking(parsedRanking)) : [];
      //this.reportsComponent.setRankings(rankings);
      this.rankings = rankings;
    } catch(e) {
        console.error("Invalid rankings JSON");
    }
  }

  public onClickTab(event) {
    if (event.index === 2) {
      this.reportsComponent.setRankings(this.rankings);
    }
  }

  private onDispositionReady() {
    if (this.rankings === null) this.rankings = [];
    this.updateBoxesNames();
    this.colorBoxes();
    this.updateSimplifiedBoxes();
    this.isRaceLoading = false;
  }

  private updateBoxesNames() {
    this.nestableList.forEach(item => {
      if(item.type === "loop") {
        item.children.forEach(child => {
          this.updateBoxName(child);
        });
      } else {
        this.updateBoxName(item);
      }
    });
  }

  private updateBoxName(box: any) {
    let matchingBox = this.availableBoxes.find(availableBox => box.Id === availableBox.Id)
    if (matchingBox != null) {
      box.name = matchingBox.Name;
    }
  }

  private colorBoxes() {
    // Set current boxes color
    this.tools.forEach(tool => {
      if (tool.type !== "loop") {
        this.colorSchemeService.colorBox(tool);
      } else {
        tool.color = "rgba(255, 255, 255, 255)";
      }
    });
    this.nestableList.forEach(item => {
      if (item.type !== "loop") {
        this.colorSchemeService.colorBox(item);
      } else {
        item.color = "rgba(255, 255, 255, 255)";
        item.children.forEach(child => {
          this.colorSchemeService.colorBox(child);
        });
      }
    });
  }

  onDragged( item:any, list:any[], effect:DropEffect ) {

    if( effect === "move" ) {
      const index = list.indexOf(item);
      list.splice(index, 1);
    }
    this.updateSimplifiedBoxes();
  }

  onDrop( event:DndDropEvent, list?:any[] ) {
    if(list && (event.dropEffect === "copy" || event.dropEffect === "move")) {
      // Get index of new item
      let index = event.index;
      if(typeof index === "undefined") {
        index = list.length;
      }

      // Insert new item
      let copy: NestableListItem = Object.assign({}, event.data);
      if (event.dropEffect === "copy") {
        if (copy.type === "loop") {
          // Add empty children to show drop zone
          copy.children = [];
        } else {
          copy.distance = 1;
          copy.nestableListId = this.findUniqueNestableListId();
          this.colorSchemeService.colorBox(copy);
        }
      }
      list.splice(index, 0, copy);
      this.updateSimplifiedBoxes();
    }
  }

  onRemoveItem(item:any, list?:any[]) {
    const index = list.indexOf(item);

    if (index !== -1) {
        list.splice(index, 1);
    }
    this.updateSimplifiedBoxes();
  }

  onToolClicked(item:any) {
    if(typeof item !== "undefined") {
      let copy: NestableListItem = Object.assign({}, item);

      if (copy.type === "loop") {
        copy.children = [];
        copy.laps = 1;
      } else {
        copy.distance = 1;
        copy.nestableListId = this.findUniqueNestableListId();
        this.colorSchemeService.colorBox(copy);
      }   
      this.nestableList.push(copy);
      this.updateSimplifiedBoxes();
    }
  }

  private updateSimplifiedBoxes() {
    this.boxes = this.racesService.generateSimplifiedBoxes(this.nestableList);
  }

  isStartBox(item: NestableListItem) {
    return this.nestableList.indexOf(item) === 0;
  }

  onSubmit() {

    if (this.raceDiscipline == 2) // km/h
    {
      this.rhythm = 60 / this.rhythm;
    }
    else if (this.raceDiscipline == 3) //sec/100s
    {
      this.rhythm = this.rhythm / 6;
    }
    else if (this.raceDiscipline == 4) // m/min
    {
      this.rhythm = 1000 / this.rhythm;
    }
    
    let nestableListCopy: any[] = this.copyWithoutColorsAndIds(this.nestableList);
    let hasDispositionChanged: boolean = JSON.stringify(this.oldNestableList) !== JSON.stringify(nestableListCopy);   
    this.convertDistancesKmToM(nestableListCopy);
    let simplifiedBoxes = this.racesService.generateSimplifiedBoxes(nestableListCopy);

    let newRace = {
      Name: this.raceName,
      StartDate: ConfigurationComponent.dateTimeInputsToString(this.raceDate, this.raceTime),
      Discipline: this.raceDiscipline,
      Description: "",
      Disposition: nestableListCopy,
      SimplifiedDisposition: simplifiedBoxes,
      ReportsCriteria: JSON.stringify(this.reportsComponent.getRankings()),
      MaxRhythm: this.rhythm,
    };

    if (this.raceId === 0) {
      // Create race
      this.racesService.addRace(this.eventId, newRace).then(data => {
        this.router.navigate(['app/events', this.eventId]);
        this.snackBarService.open("Épreuve créée", MessageType.Success);
      }).catch(error => console.error(error));
    } 
    else 
    {
      // Update race
      if(this.oldRhythm !== this.rhythm || this.oldRaceTime !== this.raceTime || hasDispositionChanged ) {
        let deleteDialog = this.dialog.open(WarningDialogComponent, {});
        deleteDialog.afterClosed().subscribe(isConfirmed => {
          if(isConfirmed) {
            this.racesService.updateRace(this.eventId, this.raceId, newRace).then(data => {
              this.racesService.regenerateFilteredTimes(this.eventId, this.raceId);
              this.router.navigate(['app/events', this.eventId]);
              this.snackBarService.open("Épreuve modifiée", MessageType.Success);
            }).catch(error => console.error(error));
          }
        });
      }
      else
      {
        this.racesService.updateRace(this.eventId, this.raceId, newRace).then(data => {
          this.router.navigate(['app/events', this.eventId]);
          this.snackBarService.open("Épreuve modifiée", MessageType.Success);
        }).catch(error => console.error(error));
      }
    }
  }

  onCancel() {
    this.router.navigate(['app/events/' + this.eventId]);
  }

  isSubmitDisabled(formVar: any) {
    let boxCount = 0;
    this.nestableList.forEach(item => {
      if (item.type === "loop" && item.children != null) {
        item.children.forEach(child => {
          if (child.type === "box") {
            boxCount++;
          }
        });
      } else if (item.type === "box") {
        boxCount++;
      }
    });
    return !formVar.form.valid || boxCount < 1;
  }

  getCurrentTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    return ("0" + h.toString()).slice(-2)  + ":" + ("0" + m.toString()).slice(-2) + ":" + ("0" + s.toString()).slice(-2);

  }

  setCurrentTime(){
    this.raceTime = this.getCurrentTime();
  }

  private convertDistancesKmToM(list: any[]) {
    list.forEach(item => {
      if (item.type === "loop") {
        this.convertDistancesKmToM(item.children);
      } else {
        item.distance = Math.trunc(item.distance * 1000);
      }
    });
  }

  private convertDistancesMToKm(list: any[]) {
    list.forEach(item => {
      if (item.type === "loop") {
        this.convertDistancesMToKm(item.children);
      } else {
        item.distance /= 1000;
      }
    });
  }

  public getBoxSplits(box: any): string {
    let splits: string[] = [];
    this.boxes.forEach(simplifiedBox => {
      if (simplifiedBox.nestableListId === box.nestableListId) {
        splits.push(simplifiedBox.pos.toString());
      }
    });    
    return splits.join(', ');
  }

  private findUniqueNestableListId(): number {
    let id = 0;
    while (!this.isNestableListIdUnique(id)) {
      id++;
    }
    return id;
  }

  private isNestableListIdUnique(id: number): boolean {
    let isUnique: boolean = true;
    this.nestableList.forEach(item => {
      if (item.type !== "loop") {
        if (item.nestableListId === id) {
          isUnique = false;
        }
      } else {
        item.children.forEach(child => {
          if (child.nestableListId === id) {
            isUnique = false;
          }
        });
      }
    });
    return isUnique;
  }
}
