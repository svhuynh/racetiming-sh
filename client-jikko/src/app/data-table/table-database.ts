import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ColorSchemeService } from '../color-scheme.service';

/** An example database that the data source uses to retrieve data for the table. */
export class TableDatabase {
  private i = 0;

  /** Stream that emits whenever the data has been modified. */
  private _dataChange: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  private colorSchemeService: ColorSchemeService;

  get dataChange(): BehaviorSubject<any[]> { return this._dataChange; }
  get data(): any[] { return this._dataChange.value; }

  constructor() {
  }

  public setColorSchemeService(colorSchemeService: ColorSchemeService) {
    this.colorSchemeService = colorSchemeService;
  }

  public setDataSource(newData: any[]): void {
    let copiedData = newData != null ? newData.slice() : [];
    copiedData.forEach(item => {
      item.id = this.i++;
      item.highlightState = false;
      if (item.BoxNo != null) {
        this.colorSchemeService.colorItem(item);
      }
    });
    this._dataChange.next(copiedData);
  }

  public add(item: any): void {
    const copiedData = this.data.slice();
    item.id = this.i++;
    this.colorSchemeService.colorItem(item);
    item.highlightState = true;
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

  public passiveUpdate(newData: any[]): void {
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
          this.update(oldItem.id, newItem);
        }
      // Add items
      } else {
        this.add(newItem);
      }
    });
    // Remove items
    this.data.forEach(oldItem => {
      if (newData.find(newItem => newItem.FilteredTimeId === oldItem.FilteredTimeId) == null) {
        this.remove(oldItem.id);
      }
    });
  }

}
