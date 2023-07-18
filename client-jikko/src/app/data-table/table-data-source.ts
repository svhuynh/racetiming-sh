import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DataSource } from '@angular/cdk/collections';
import { MatSort, MatPaginator } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { TableDatabase } from './table-database'

/**
 * Data source to provide what data should be rendered in the table. Note that the data source
 * can retrieve its data in any way. In this case, the data source is provided a reference
 * to a common data base, TableDatabase. It is not the data source's responsibility to manage
 * the underlying data. Instead, it only needs to take the data and send the table exactly what
 * should be rendered.
 */
export class TableDataSource extends DataSource<any> {
  private _filteredData: any[] = [];
  private _renderedData: any[] = [];
  private _filterChange = new BehaviorSubject('');

  get filter(): string { return this._filterChange.value; }
  set filter(filter: string) { this._filterChange.next(filter); }
  get renderedData(): any[] { return this._renderedData; }
  get filteredData(): any[] { return this._filteredData; }

  constructor(private _database: TableDatabase,
              private _paginator: MatPaginator,
              private _sort: MatSort) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  public connect(): Observable<any[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this._database.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      // Filter data
      this._filteredData = this._database.data.slice().filter((item: any) => {
        let searchStr = "";
        Object.keys(item).forEach(field => searchStr += item[field]);
        searchStr = searchStr.toLowerCase();
        return searchStr.indexOf(this.filter.toLowerCase()) != -1;
      });

      // Sort filtered data
      const sortedData = this.sortData(this.filteredData.slice());

      // Grab the page's slice of the filtered sorted data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      this._renderedData = sortedData.splice(startIndex, this._paginator.pageSize);
      return this.renderedData;
    });
  }

  public disconnect() {}

  /** Returns a sorted copy of the database data. */
  private sortData(data: any[]): any[] {
    if (!this._sort.active || this._sort.direction == '') { return data; }

    return data.sort((a, b) => {

      let propertyA: number|string = '';
      let propertyB: number|string = '';

      [propertyA, propertyB] = [a[this._sort.active], b[this._sort.active]]

      if (typeof propertyA === "string") {
        propertyA = propertyA.toLowerCase();
      }
      if (typeof propertyB === "string") {
        propertyB = propertyB.toLowerCase();
      }

      let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      if (valueA === 0)
      {
        return 1;
      }

      if (valueB === 0)
      {
        return -1;
      }

      return (valueA < valueB ? -1 : 1) * (this._sort.direction == 'asc' ? 1 : -1);
    });
  }
}