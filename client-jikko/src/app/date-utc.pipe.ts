import { Pipe, PipeTransform } from '@angular/core';
import { ConfigurationComponent } from './configuration/configuration.component';

@Pipe({
  name: 'dateUtc'
})
export class DateUtcPipe implements PipeTransform {

  transform(value: any): any {
      if (!value) {
        return '';
      }

      const dateValue = new Date(value);
      const dateWithNoTimezone = dateValue.toUTCString().slice(0, -13);

      return dateWithNoTimezone;
    }
}
