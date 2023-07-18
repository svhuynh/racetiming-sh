import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Output, EventEmitter } from '@angular/core';
import { DataTableAnnouncerComponent } from './data-table-announcer.component';
import { ColorSchemeService } from '../color-scheme.service';

/** An example database that the data source uses to retrieve data for the table. */
export class TableDatabaseAnnouncer {
  private i = 0;
  @Output() addCount_: EventEmitter<number> = new EventEmitter<number>();
  public addCount: number;
  /** Stream that emits whenever the data has been modified. */
  private _dataChange: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  private colorSchemeService: ColorSchemeService;
  get dataChange(): BehaviorSubject<any[]> { return this._dataChange; }
  get data(): any[] { return this._dataChange.value; }

  constructor(private dataTable_: DataTableAnnouncerComponent) {
  this.addCount = 0;
  }

  public setColorSchemeService(colorSchemeService: ColorSchemeService) {
    this.colorSchemeService = colorSchemeService;
  }

  public setDataSource(newData: any[]): void {
    let copiedData = newData != null ? newData.slice() : [];
    copiedData.forEach(item => {
      item.id = this.i++;
      item.highlightState = false;
    });
    this._dataChange.next(copiedData);
  }

  public setDataAnnouncerSource(newData: any[]): void {
    let copiedData = newData != null ? newData.slice() : [];
    copiedData.forEach(item => {
      item.id = this.i++;
      item.highlightState = false;
    });
    this._dataChange.next(copiedData);
  }

  public setAnnouncerSource(newData: any[]): void {
    let copiedData = newData != null ? newData.slice() : [];
    copiedData.forEach(item => {
      item.id = this.i++;
      item.highlightState = false;
    });
    this._dataChange.next(copiedData);
  }

  public getSortOrder(prop) {
    return function (a, b) {
      if (a[prop] > b[prop]) {
        return 1;
      } else if (a[prop] < b[prop]) {
        return -1;
      }
      return 0;
    }
  }

  public add(item: any): void {
    const copiedData = this.data.slice();
    item.id = this.i++;
    this.colorSchemeService.colorItem(item);
    // item.highlightState = true;
    copiedData.push(item);
    this._dataChange.next(copiedData);
  }

  public remove(id: number): void {
    let itemIndex = this.data.findIndex(item => item.id === id);
    if (itemIndex > -1) {
      let copiedData = this.data.slice();
      copiedData.splice(itemIndex, 1);
      this._dataChange.next(copiedData);
    }
  }

  public update(id: number, newItem: any) {
    let itemIndex = this.data.findIndex(item => item.id === id);
    if (itemIndex > -1) {
      let copiedData = this.data.slice();
      Object.keys(newItem).forEach(field => {
        copiedData[itemIndex][field] = newItem[field];
      });
      copiedData[itemIndex].highlightState = true;  // Trigger animation
      this._dataChange.next(copiedData);
    }
  }

  public getItem(id: number): any {
    let itemIndex = this.data.findIndex(item => item.id === id);
    if (itemIndex > -1) {
      return Object.assign({}, this.data[itemIndex]);
    } else {
      return null;
    }
  }

  // For the announcer not to put the updated times at the top
  public announcerUpdate(newData: any[]): void {
    newData.forEach(newItem => {
      let oldItem = this.data.find(oldItem => oldItem.FilteredTimeId === newItem.FilteredTimeId);
      // Update items
      if (oldItem != null) {
        let isDifferent = false;
        Object.keys(newItem).forEach(key => {
          if (oldItem[key] !== newItem[key]) {
            isDifferent = true;
          }
        });
        if (isDifferent) {
          let itemIndex = this.data.findIndex(item => item.id === oldItem.id);
          if (itemIndex > -1) {
            let copiedData = this.data.slice();
            Object.keys(newItem).forEach(field => {
              copiedData[itemIndex][field] = newItem[field];
            });
            copiedData[itemIndex].highlightState = true;
          }
        }
        // Add items
      } else {
        const copiedData = this.data.slice();
        newItem.id = this.i++;
        if (this.addCount % 2) {
          newItem.color = 'white';
          newItem.fontColor = 'black';
        } else {
          newItem.color = 'black';
          newItem.fontColor = 'white';
        }
        this.addCount++;
        this.addCount_.emit(this.addCount);
        copiedData.push(newItem);
        this._dataChange.next(copiedData);
      }
    });
    this.data.forEach(oldItem => {
      if (newData.find(newItem => newItem.FilteredTimeId === oldItem.FilteredTimeId) == null) {
        this.remove(oldItem.id);
      }
    });
  }

}
