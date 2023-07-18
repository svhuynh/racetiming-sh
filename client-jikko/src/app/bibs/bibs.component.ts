import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { BibsService, Bib } from '../bibs.service';
import { ActivatedRoute } from '@angular/router';
import { DataTableComponent } from '../data-table/data-table.component';
import { SnackBarService, MessageType } from '../snack-bar.service';
import { DownloadExcelFileComponent } from '../download-excel-file/download-excel-file.component';
import { EventsService } from '../events.service';
import * as XLSX from 'xlsx';

type AOA = any[][];

@Component({
  selector: 'app-bibs',
  templateUrl: './bibs.component.html',
  styleUrls: ['./bibs.component.css']
})
export class BibsComponent implements OnInit {
  data: AOA = [[1, 2], [3, 4]];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  columns: any = [];
  public fieldsDescription: any;
  private eventId: number;
  public areBibsLoading: boolean;
  private isFirstRefresh: boolean;
  public currentEventName: any;
  public races: any;
  public selectedRace: any;
  public bibs: any[] = [];

  public dossard = {
    BibNo: null,
    Chip1: null,
    Chip2: null
  };

  @ViewChild(DataTableComponent) dataTable: DataTableComponent;
  @ViewChild(DownloadExcelFileComponent) excelFile: DownloadExcelFileComponent;

  constructor(private bibsService: BibsService,
    private route: ActivatedRoute,
    private eventsService: EventsService,
    private snackBarService: SnackBarService) {
    this.fieldsDescription = Bib.fieldsDescription;
  }

  ngOnInit() {
    this.dataTable.defaultSettings();
    this.areBibsLoading = true;
    this.isFirstRefresh = true;
    this.eventId = parseInt(this.route.snapshot.paramMap.get('eventId'));

    this.eventsService.getEvent(this.eventId)
      .then(event => {
        this.currentEventName = event.Name;
    }).catch(error => console.error(error));

    this.refreshBibs();
  }

  public onEditSelection(bib) {
    const oldBib = this.dataTable.getRowFromId(bib.id);

    this.bibsService.removeBib(this.eventId, oldBib.BibNo)
      .then(() => {
        this.bibsService.addBib(this.eventId, bib)
          .then(() => {
            this.snackBarService.open("Dossard modifié", MessageType.Success);
          });
      }).catch(error => {
        this.snackBarService.open("Erreur lors de la modification du dossard", MessageType.Error);
        console.error(error);
      }).then(() => {
        this.dataTable.clearSelection();
        this.refreshBibs();
      });
  }

  private refreshBibs() {
    this.areBibsLoading = true;
    if (!this.isFirstRefresh) {
      this.dataTable.setDataSource([]);
    }

    this.bibsService.getBibs(this.eventId)
      .then(bibs => {
        this.bibs = Array.from(bibs, bib => Object.assign({}, bib));
        this.dataTable.setDataSource(bibs);
      }).catch(error => {
        console.error(error);
        this.snackBarService.open("Erreur lors du chargement des dossards", MessageType.Error);
      }).then(() => {
        this.dataTable.clearSelection();
        this.areBibsLoading = false;
        this.isFirstRefresh = false;
      });
  }

  public onDeleteSelection(bibs) {
    this.dataTable.setDataSource([]);
    this.areBibsLoading = true;

    let removeBibPromises = [];
    bibs.forEach(bib => {
      removeBibPromises.push(this.bibsService.removeBib(this.eventId, bib.BibNo))
    });

    Promise.all(removeBibPromises)
      .then(() => {
        const plural = removeBibPromises.length > 1 ? 's' : '';
        this.snackBarService.open("Dossard" + plural + " supprimé" + plural, MessageType.Success);
      }).catch(error => {
        this.snackBarService.open("Erreur lors de la suppression d'un ou de plusieurs dossards", MessageType.Error);
        console.error(error);
      }).then(() => {
        this.dataTable.clearSelection();
        this.refreshBibs();
      });
  }

  public onAddClick() {
    this.dataTable.openAddDialog("Ajouter un dossard", new Bib());
  }

  public onAddSave(bib) {
    this.bibsService.addBib(this.eventId, bib)
      .then(() => {
        this.refreshBibs();
        this.snackBarService.open("Dossard ajouté", MessageType.Success);
      }).catch(error => {
        this.snackBarService.open("Erreur lors de la création du dossard", MessageType.Error);
        console.error(error);
      });
  }

  public downloadJSONToXLSX() {
      try {
        this.excelFile.exportAsExcelFile(this.bibs, this.currentEventName, "Dossards_" + this.currentEventName);
      } catch(error) {
        console.error(error);
        this.snackBarService.open("Erreur lors du téléchargement des dossards", MessageType.Error);
      }
  }

  handleFileInput(files: File) {
    this.bibsService.getBibs(this.eventId)
      .then(bibs => {
        this.areBibsLoading = true;

        // Delete all bibs
        bibs.forEach(bib => { this.bibsService.removeBib(this.eventId, bib.BibNo); });

        // Create file reader
        const reader: FileReader = new FileReader();

        reader.onload = (e: any) => {
          // Create workbook to extract data (json)
          const bstr: string = e.target.result;
          const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'buffer' });
          const wsname: string = wb.SheetNames[0];
          const ws: XLSX.WorkSheet = wb.Sheets[wsname];
          this.data = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1, range: this.update_sheet_range(ws) }));
          // Read data
          this.parseData(this.data);
        };

        // On load file
        reader.readAsArrayBuffer(files[0]);
      });
  }

  update_sheet_range(ws) {
    const range = { s: { r: 20000000, c: 20000000 }, e: { r: 0, c: 0 } };
    Object.keys(ws).filter(function (x) { return x.charAt(0) !== '!'; }).map(XLSX.utils.decode_cell).forEach(function (x) {
      range.s.c = Math.min(range.s.c, x.c); range.s.r = Math.min(range.s.r, x.r);
      range.e.c = Math.max(range.e.c, x.c); range.e.r = Math.max(range.e.r, x.r);
    });
    return ws['!ref'] = XLSX.utils.encode_range(range);
  }

  parseData(data: any) {
    const columns = data[0];
    const dossard = this.dossard;
    let column: any;

    // Get column names
    for (let i = 0; i < columns.length; i++) {
      column = columns[i];
      this.columnName(column);
    }

    // Add bibs
    let addBibPromises = [];
    for (let j = 1; j < data.length; j++) {
      for (let k = 0; k < columns.length; k++) {
        column = this.columns[k];
        dossard[column] = parseInt(data[j][k]);
      }
      addBibPromises.push(this.bibsService.addBib(this.eventId, dossard));
    }

    Promise.all(addBibPromises)
      .then(() => {
        this.snackBarService.open("Dossards ajoutés", MessageType.Success);
      }).catch(error => {
        this.snackBarService.open("Erreur lors de l'ajout d'un ou de plusieurs dossards", MessageType.Warning);
        console.error(error);
      }).then(() => {
        this.refreshBibs();
      });
  }

  columnName(column: any) {
    switch ((column.toLowerCase()).trim()) {
      case 'dossard':
      case 'bib':
      case 'bibno':
        this.columns.push('BibNo');
        break;
      case 'puce 1':
      case 'puce1':
      case 'chip 1':
      case 'chip1':
        this.columns.push('Chip1');
        break;
      case 'puce 2':
      case 'puce2':
      case 'chip 2':
      case 'chip2':
        this.columns.push('Chip2');
        break;
    }
  }

}
