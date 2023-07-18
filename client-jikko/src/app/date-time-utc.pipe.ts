import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateTimeUtc'
})
export class DateTimeUtcPipe implements PipeTransform {

  transform(value: any): any {
    if (!value) {
      return '';
    }

    const dateValue = new Date(value);
    const dateWithNoTimezone = dateValue.toUTCString().slice(0, -3);

    return dateWithNoTimezone;
  }

}
