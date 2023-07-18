import { Pipe, PipeTransform } from '@angular/core';
import {ConfigurationComponent} from "../app/configuration/configuration.component"

@Pipe({
  name: 'dataTablePipe'
})
export class DataTablePipe implements PipeTransform {

  transform(value: any, type: string): any {

    if(type === "time")
    {
      if (value != null) {
        const dateValue = new Date(value);
        const time = ConfigurationComponent.formatTimeForInput(dateValue);
        return time;
      } else {
        return '-';
      }
    }
    else if(type === "date")
    {
      if (value != null) {
        const dateValue = new Date(value);
        const date = ConfigurationComponent.formatDateToString(dateValue);
        return date;
      } else {
        return '';
      }
    }
    else if(type === "gender")
    {
      let gender = "";

      if (value === 0)
      {
        gender = "Homme";
      }
      else if (value === 1)
      {
        gender = "Femme";
      }

      return gender;
    } 
    else if (type === "min/km") 
    {
      let m = Math.trunc(value);
      let s = Math.round((value - m) * 60);

      if (s < 10)
      {
        return m + ":0" + s; 
      }

      return m + ":" + s;
    } 
    else if (type === "km/h") 
    {
      return (60 / value).toFixed(2);
    }
    else if (type === "sec/100m") 
    {
      return (value * 6).toFixed(2); // value * 60 / 10
    }
    else if (type === "m/min") 
    {
      return (1000/value).toFixed(2);
    }
    else if (type === "meter") 
    {
      return value/1000;
    }
    else
    {
      return value;
    }
    
  }

}
