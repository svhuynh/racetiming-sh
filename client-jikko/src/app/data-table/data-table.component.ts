import { Component, ElementRef, ViewChild, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSort, MatPaginator, MatPaginatorIntl } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { ParticipantsService } from '../participants.service';
import { Participant } from '../participants.service';
import { MatDialog } from '@angular/material';
import { RowEditDialogComponent } from '../row-edit-dialog/row-edit-dialog.component';
import { SnackBarService, MessageType } from '../snack-bar.service';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { TableDatabase } from './table-database';
import { TableDataSource } from './table-data-source';
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
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css'],
  animations: [
    trigger('highlightState', [
      state('false', style({
        transform: 'scale(1)'
      })),
      state('true', style({
        backgroundColor: '{{color}}',
        transform: 'scale(1.05)'
      }), { params: { color: 'green' } }), // Default color
      transition('false => true', animate('400ms ease-in')),
      transition('true => false', animate('400ms 4000ms ease-out'))
    ])
  ]
})
export class DataTableComponent implements OnInit {
  public allColumns: string[];
  private database: TableDatabase;
  public selection: SelectionModel<number>;
  public dataSource: TableDataSource | null;
  public dataFields: string[];
  public displayedColumns: FormControl;
  public _fieldsDescription: Map<string, FieldDescription>;
  public minHeigth: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;
  @Input() areItemsLoading: boolean;
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
  @Output() editClick: EventEmitter<any> = new EventEmitter();

  constructor(private participantsService: ParticipantsService,
    private dialog: MatDialog,
    private snackBarService: SnackBarService,
    private colorSchemeService: ColorSchemeService) { }

  ngOnInit() {
    this.dataFields = Array.from(this._fieldsDescription.keys());
    this.allColumns = ['select'].concat(this.dataFields);
    this.displayedColumns = new FormControl();
    this.displayedColumns.setValue(this.allColumns.slice());
    this.database = new TableDatabase();
    this.database.setColorSchemeService(this.colorSchemeService);
    this.selection = new SelectionModel<number>(true, []);
    this.dataSource = new TableDataSource(this.database, this.paginator, this.sort);

    // Init filter
    Observable.fromEvent(this.filter.nativeElement, 'keyup')
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        this.filterItems();
      });
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
      this.editClick.emit(this.database.getItem(this.selection.selected[0]));
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

  public passiveUpdate(data: any[]): void {
    if (this.database != null) {
      this.database.passiveUpdate(data);
    }
  }

  public annonceurSettings() {
    this.minHeigth = "{ 'min-height': 10px; }";
  }
  
  public defaultSettings() {
    this.minHeigth = "{ 'min-height': 2px; }";
  }

  public getSelectedRow() {
    if (this.selection != null && this.selection.selected != null && this.selection.selected.length > 0) {
      return this.database.getItem(this.selection.selected[0]);
    }
    return null;
  }
}



const frenchRangeLabel = (page: number, pageSize: number, length: number) => {
  if (length == 0 || pageSize == 0) { return `0 de ${length}`; }
  
  length = Math.max(length, 0);

  const startIndex = page * pageSize;

  // If the start index exceeds the list length, do not try and fix the end index to the end.
  const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;

  return `${startIndex + 1} - ${endIndex} de ${length}`;
}


export function getFrenchPaginatorIntl() {
  const paginatorIntl = new MatPaginatorIntl();
  
  paginatorIntl.itemsPerPageLabel = 'Éléments par page :';
  paginatorIntl.nextPageLabel = 'Page suivante';
  paginatorIntl.previousPageLabel = 'Page précédente';
  paginatorIntl.getRangeLabel = frenchRangeLabel;
  
  return paginatorIntl;
}
