import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import { RacesService } from '../races.service';

@Component({
  selector: 'app-raw-times-dialog',
  templateUrl: './raw-times-dialog.component.html',
  styleUrls: ['./raw-times-dialog.component.css']
})
export class RawTimesDialogComponent implements OnInit {

  public allFilteredTimes: any[];
  public allRawTimes: any[];
  public bibNo: number = null;

  constructor(public dialogRef: MatDialogRef<RawTimesDialogComponent>,
    private racesService: RacesService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if (this.data.bibNo != null) {
      this.bibNoChange(this.data.bibNo);
    }
  }

  public bibNoChange(newValue) {
    if(newValue != null)
    {
      this.bibNo = newValue;
      this.racesService.getRawTimes(this.data.eventId, this.data.raceId, this.bibNo).then(times =>{
        this.allFilteredTimes = times[0];
        this.allRawTimes = times[1];
      });
    }
  }

}
