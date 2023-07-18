import { Input, Component, OnInit } from '@angular/core';
import { FieldDescription } from '../field-description';
import * as XLSX from 'xlsx';

const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-download-excel-file',
  templateUrl: './download-excel-file.component.html',
  styleUrls: ['./download-excel-file.component.css']
})
export class DownloadExcelFileComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Input() fieldsDescription: Map<string, FieldDescription> = new Map();

  public exportAsExcelFile(jsonData: any[], sheetName: string, fileName: string): void {
    if (jsonData == null || jsonData.length === 0) return;

    sheetName = this.cropSheetName(sheetName);
    let workbook: XLSX.WorkBook = { Sheets: {}, SheetNames: [sheetName] }
    let worksheet: XLSX.WorkSheet = this.createWorksheet(jsonData);
    workbook.Sheets[sheetName] = worksheet;
    XLSX.writeFile(workbook, fileName + EXCEL_EXTENSION);
  }

  public exportAsExcelFileTabs(jsonDataTabs: any[][], sheetNames: string[], fileName: string) {
    sheetNames.forEach(sheetName => sheetName = this.cropSheetName(sheetName));

    let workbook: XLSX.WorkBook = { Sheets: {}, SheetNames: sheetNames }
    for(let i = 0; i < jsonDataTabs.length; i++) {
      let worksheet: XLSX.WorkSheet = this.createWorksheet(jsonDataTabs[i]);
      workbook.Sheets[sheetNames[i]] = worksheet;
    }
    XLSX.writeFile(workbook, fileName + EXCEL_EXTENSION);
  }

  /*private addCorrectHeaders(item: any, worksheet: XLSX.WorkSheet): XLSX.WorkSheet {
    let headers: string[] = [];
    for (let property in item) {
      let fieldDescription = this.fieldsDescription.get(property);
      headers.push(fieldDescription != null ? fieldDescription.displayName : property);
    }
    let json = XLSX.utils.sheet_to_json(worksheet, {header: headers, blankrows: true, defval: ''});
    return XLSX.utils.json_to_sheet(json);
  }*/

  private cropSheetName(sheetName: string): string {
    return sheetName.length > 31 ? sheetName.substring(0, 31) : sheetName;
  }

  private createWorksheet(jsonData: any[]): XLSX.WorkSheet {
    this.formatProperties(jsonData);
    let worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
    return worksheet;
  }

  private formatProperties(jsonData: any[]): void {
    jsonData.forEach(row => {
      if ('Id' in row) {
        delete row.Id;
      }
      if ('FilteredTimeId' in row) {
        delete row.FilteredTimeId;
      }
      if ('Gender' in row) {
        if (row.Gender === 1) { row.Gender = 'Femme'; }
        if (row.Gender === 0) { row.Gender = 'Homme'; }
        if (row.Gender === 2) { row.Gender = ''; }
      }
      if ('BirthDate' in row && row.BirthDate != null && row.BirthDate.length > 10) {
        // Remove time
        row.BirthDate = row.BirthDate.slice(0, 10);
      }
      if ('RegistrationDate' in row && row.RegistrationDate != null && row.RegistrationDate.length > 10) {
        // Remove time
        row.RegistrationDate = row.RegistrationDate.slice(0, 10);
      }
    });
  }
}
