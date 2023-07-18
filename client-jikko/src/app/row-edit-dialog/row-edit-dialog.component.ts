import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfigurationComponent } from '../configuration/configuration.component'

@Component({
  selector: 'app-row-edit-dialog',
  templateUrl: './row-edit-dialog.component.html',
  styleUrls: ['./row-edit-dialog.component.css']
})
export class RowEditDialogComponent implements OnInit {
  public dataFields;
  public item: any;
  public fieldsDescription: any;

  constructor(public dialogRef: MatDialogRef<RowEditDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.item = null;
    this.fieldsDescription = this.data.fieldsDescription;
    this.dataFields = Array.from(this.data.fieldsDescription.keys());

    if (this.data.item != null) {
      this.item = Object.assign({}, this.data.item);
      this.dataFields.forEach(field => {
        // if (this.fieldsDescription.get(field).inputType === "date") {
          
        //   if(this.item[field] === null)
        //   {
        //     this.item[field] = ConfigurationComponent.formatDateForInput(new Date());
        //   }
        //   else
        //   {
        //     this.item[field] = ConfigurationComponent.formatDateForInput(new Date(this.item[field]));
        //   }
          
        // }
        if (this.fieldsDescription.get(field).inputType === "date") {
          
          if(this.item[field] !== null)
          {
            this.item[field] = ConfigurationComponent.formatDateForInput(new Date(this.item[field]));
          }
          
        }
        if (this.fieldsDescription.get(field).inputType === "time") {
          if (isNaN(this.item[field]))
          {
            this.item[field] = this.getCurrentTime();
          }
          else
          {
            this.item[field] = ConfigurationComponent.formatTimeForInput(new Date(this.item[field]));
          }
          
        }
      });
    }

  }

  ngOnInit() {
    this.dialogRef.keydownEvents().subscribe(keyDown => {
      if (keyDown.keyCode == 13)
      {
        this.dialogRef.close(this.item);
      }
    });
  }

  public getFieldPlaceholder(field) {
    if (this.hasFieldDescription(field)) {
      return this.fieldsDescription.get(field).displayName;
    } else {
      return "";
    }
  }

  public getFieldInputType(field) {
    if (this.hasFieldDescription(field)) {
      return this.fieldsDescription.get(field).inputType;
    } else {
      return null;
    }
  }

  private hasFieldDescription(field) {
    return field != null &&
      this.item != null &&
      this.fieldsDescription != null &&
      this.fieldsDescription.get(field) != null
  }

  public onOk() {
  }

  public getFieldDisabled(field) {
    if (this.hasFieldDescription(field)) {
      return this.fieldsDescription.get(field).disabled;
    } else {
      return false;
    }
  }

  public getCurrentTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    return ("0" + h.toString()).slice(-2)  + ":" + ("0" + m.toString()).slice(-2) + ":" + ("0" + s.toString()).slice(-2);

  }

}
