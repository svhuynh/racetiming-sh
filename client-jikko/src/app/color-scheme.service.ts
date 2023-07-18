import { Injectable } from '@angular/core';
import { BoxesService, Box } from './boxes.service';
import * as d3 from 'd3';

@Injectable()
export class ColorSchemeService {
  private static readonly BOX_OPACITY_NEUTRAL: number = 0.55;
  private colorScale: any = null;
  private boxesToColor: any[] = [];
  private itemsToColor: any[] = [];

  constructor(private boxesService: BoxesService) {
    this.boxesService.getBoxes()
      .then(boxes => {
        this.colorScale = this.generateBoxesColorScale(boxes);
        this.colorBoxes(this.boxesToColor);
        this.boxesToColor = [];
        this.colorItems(this.itemsToColor);
        this.itemsToColor = [];
      }).catch(error => console.error(error))
  }

  /**
   * Adds a color property to a boxes array according to the color scale.
   *
   * @param {any[]} boxes  The boxes to color
   */
  public colorBoxes(boxes: any[]): void {
      boxes.forEach(box => this.colorBox(box));
  }

  /**
   * Adds a color property to a box according to the color scale.
   *
   * @param {any} box  The box to color
   */
  public colorBox(box: any): void {
    if (this.isFunction(this.colorScale)) {
      box.color = this.neutralOpacity(this.colorScale(box.Id));
    } else {
      this.boxesToColor.push(box);
    }
  }

  /**
   * Adds a color property to an items array according to the color scale.
   *
   * @param {any[]} items  The items to color
   */
  public colorItems(items: any[]): void {
    items.forEach(item => this.colorItem(item));
  }

  /**
   * Adds a color property to an item according to the color scale.
   *
   * @param {any} item  The item to color
   */
  public colorItem(item: any): void {
    if (this.isFunction(this.colorScale)) {
      item.color = this.neutralOpacity(this.colorScale(item.BoxNo));
    } else {
      this.itemsToColor.push(item);
    }
  }

  private generateBoxesColorScale(boxes: any[]): any {
    let domain = Array.from(boxes, box => box.Id);
    let colorScheme = domain.length <= 10 ? d3.schemeCategory10 : d3.schemeCategory20;
    var color = d3.scaleOrdinal(colorScheme);
    color.domain(domain);
    return color;
  }

  private neutralOpacity(color: any) {
    let rgb = d3.rgb(color)
    rgb.opacity = ColorSchemeService.BOX_OPACITY_NEUTRAL;
    return rgb.toString();
  }

  private isFunction(functionToCheck: any): boolean {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
   }
}
