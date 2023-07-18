import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toMeter'
})
export class ToMeterPipe implements PipeTransform {

  transform(value: any): any {
    return value / 1000;
  }

}
