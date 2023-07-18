import { Component, ElementRef, ViewChild, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { ParticipantsService } from '../participants.service';
import { Participant } from '../participants.service';
import { MatDialog } from '@angular/material';
import { RowEditDialogComponent } from '../row-edit-dialog/row-edit-dialog.component';
import { SnackBarService, MessageType } from '../snack-bar.service';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { TableDatabaseAnnouncer } from './table-database-announcer';
import { TableDataAnnouncerSource } from './table-data-announcer-source';
import { FieldDescription } from '../field-description';
import { ColorSchemeService } from '../color-scheme.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'app-data-announcer-table',
  templateUrl: './data-table-announcer.component.html',
  styleUrls: ['./data-table-announcer.component.css'],
  animations: [
    trigger('highlightState', [
      state('false', style({
        /*backgroundColor: 'white',*/
        transform: 'scale(1)'
      })),
      state('true', style({
        /*backgroundColor: '{{color}}',*/
        transform: 'scale(1.05)'
      }), { params: { color: 'green' } }), // Default color
      transition('false => true', animate('400ms ease-in')),
      transition('true => false', animate('400ms 4000ms ease-out'))
    ])
  ]
})
export class DataTableAnnouncerComponent implements OnInit {
  public allColumns: string[];
  private database: TableDatabaseAnnouncer;
  public selection: SelectionModel<number>;
  public dataSource: TableDataAnnouncerSource | null;
  public dataFields: string[];
  public displayedColumns: FormControl;
  public _fieldsDescription: Map<string, FieldDescription>;
  public minHeigth: string;
  public police = '30';
  public alternateEvenOdd: boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;
  @Input() areItemsLoading: boolean;
  @Input() addCount_: number;
  @Input() canAddItems: boolean = true;
  @Input() canEditItems: boolean = true;
  @Input() set data(data: any) { // To verify
    this.setDataSource(data);
  }
  @Input() set fieldsDescription(fieldsDescription: Map<string, FieldDescription>) {
    if (fieldsDescription != null) {
      this._fieldsDescription = fieldsDescription;
      this.dataFields = Array.from(this._fieldsDescription.keys());
      this.allColumns = ['select'].concat(this.dataFields);
      this.displayedColumns = new FormControl();
      this.displayedColumns.setValue(this.allColumns.slice());
    }
  }
  @Output() editSelection: EventEmitter<any> = new EventEmitter();
  @Output() deleteSelection: EventEmitter<any[]> = new EventEmitter();
  @Output() addSave: EventEmitter<any> = new EventEmitter();
  @Output() addClick: EventEmitter<any> = new EventEmitter();

  constructor(private participantsService: ParticipantsService,
    private dialog: MatDialog,
    private snackBarService: SnackBarService,
    private colorSchemeService: ColorSchemeService) { }

  ngOnInit() {
    this.dataFields = Array.from(this._fieldsDescription.keys());
    this.allColumns = ['select'].concat(this.dataFields);
    this.displayedColumns = new FormControl();
    this.displayedColumns.setValue(this.allColumns.slice());
    this.database = new TableDatabaseAnnouncer(this);
    this.database.setColorSchemeService(this.colorSchemeService);
    this.selection = new SelectionModel<number>(true, []);
    this.dataSource = new TableDataAnnouncerSource(this.database, this.paginator, this.sort);

    // Init filter
    Observable.fromEvent(this.filter.nativeElement, 'keyup')
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        this.filterItems();
      });
  }

  policeTaille(size) {
    if (!((parseInt(this.police) + size) > 50) && !((parseInt(this.police) + size) < 16)) {
      this.police = (parseInt(this.police) + size).toString();
    }
    
  }

  isAllSelected(): boolean {
    if (!this.dataSource) { return false; }
    if (this.selection.isEmpty()) { return false; }

    if (this.filter.nativeElement.value) {
      return this.selection.selected.length == this.dataSource.renderedData.length;
    } else {
      return this.selection.selected.length == this.database.data.length;
    }
  }

  masterToggle() {
    if (!this.dataSource) { return; }

    if (this.isAllSelected()) {
      this.selection.clear();
    } else if (this.filter.nativeElement.value) {
      this.dataSource.renderedData.forEach(data => this.selection.select(data.id));
    } else {
      this.database.data.forEach(data => this.selection.select(data.id));
    }
  }

  onEditSelection() {
    if (this.selection.selected.length === 1) {
      let dialogRef = this.dialog.open(RowEditDialogComponent, {
        data: {
          item: this.database.getItem(this.selection.selected[0]),
          fieldsDescription: this._fieldsDescription,
          title: "Modifier"
        }
      });
      dialogRef.afterClosed().subscribe(participant => {
        if (participant != null) {
          this.editSelection.emit(participant);
        }
      });
    }
  }

  onDeleteSelection() {
    let deleteDialog = this.dialog.open(DeleteDialogComponent, {});
    deleteDialog.afterClosed().subscribe(isConfirmed => {
      if (isConfirmed) {
        // Delete from DB
        let selectedItems = Array.from(this.selection.selected, id =>
          this.database.getItem(id));
        this.deleteSelection.emit(selectedItems);

        // Delete locally
        this.selection.selected.forEach(id => this.database.remove(id));
        this.selection.clear();
      }
    });
  }

  public openAddDialog(title: string, item: any) {
    let dialogRef = this.dialog.open(RowEditDialogComponent, {
      data: {
        item: item,
        fieldsDescription: this._fieldsDescription,
        title: title
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.addSave.emit(result);
      }
    });
  }

  public openCustomAddDialog(title: string, item: any, customFieldsDescription: Map<string, FieldDescription>, comboBoxData: any) {
    let dialogRef = this.dialog.open(RowEditDialogComponent, {
      data: {
        item: item,
        fieldsDescription: customFieldsDescription,
        title: title,
        comboBoxData: comboBoxData
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.addSave.emit(result);
      }
    });
  }

  public setDataSource(data: any[]): void { // To verify
    if (typeof data != 'undefined') {
      this.clearSelection();
      this.displayedColumns.setValue(this.allColumns.slice());
      this.database.setDataSource(data);
    }
  }

  public setDataAnnouncerSource(data: any[]): void { // To verify
    if (typeof data != 'undefined') {
      this.clearSelection();
      this.displayedColumns.setValue(this.allColumns.slice());
      this.database.setDataAnnouncerSource(data);
    }
  }

  public sortItems(field: string): void {
    let sortable = this.sort.sortables.get(field);
    if (sortable != null) {
      this.sort.sort(sortable);
    }
  }

  public update(id: number, newItem: any) {
    this.database.update(id, newItem);
  }

  public add(item: any) {
    this.database.add(item);
  }

  public clearSelection(): void {
    this.selection.clear();
  }

  public getRowFromId(id: number): any {
    return this.database.getItem(id);
  }

  public onAddClick() {
    this.addClick.emit();
  }

  public clearFilter() {
    if (this.filter.nativeElement != null) {
      this.filter.nativeElement.value = '';
      this.filterItems();
    }
  }

  private filterItems() {
    if (!this.dataSource) { return; }
    this.dataSource.filter = this.filter.nativeElement.value;
  }

  public clearFilterButtonVisibility() {
    if (this.filter.nativeElement != null && this.filter.nativeElement.value.length > 0) {
      return '';
    } else {
      return 'hidden';
    }
  }

  public highlightAnimationDone(row: any) {
    row.highlightState = false;
  }

  public toggleRowSelection(id: number): void {
    if (this.canEditItems) {
      this.selection.toggle(id);
    }
  }

  /*public passiveUpdate(data: any[]): void {
    if (this.database != null) {
      this.database.passiveUpdate(data);
    }
  }*/

  public announcerUpdate(data: any[]): void {
    if (this.database != null) {
      this.database.announcerUpdate(data);
    }
    if (data != null) {
      this.alternateEvenOdd = data.length % 2 === 0;
    }
  }
}
