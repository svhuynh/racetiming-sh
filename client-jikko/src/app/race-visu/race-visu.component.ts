import { Component, OnInit, AfterViewInit, Input  } from '@angular/core';
//import { Box } from "../race-editor/race-editor.component";
import * as d3 from 'd3';

@Component({
  selector: 'app-race-visu',
  templateUrl: './race-visu.component.html',
  styleUrls: ['./race-visu.component.css']
})
export class RaceVisuComponent implements OnInit {
  @Input()
  set boxes(boxes: any[]) {
    this._boxes = boxes;
    
    if (this.isViewInit) {
      this.updateVisu(this._boxes);
    }
  }

  _boxes: any[];
  isViewInit: boolean;
  x: any;
  xAxis: any;
  margin: any;
  updateVisu: any;

  constructor() {  
  }

  ngOnInit() {
    this._boxes = [];
    this.isViewInit = false;
    
    this.margin = {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50
    };
  }

  ngAfterViewInit() {
    let svg = d3.select("svg.d3-svg")
      .attr("width", '100%')
      .attr("height", '100')
      .attr('preserveAspectRatio','xMinYMin');

    let svgWidth = parseFloat(svg.style('width'));
    let svgHeight = parseFloat(svg.style('height'));

    let width = svgWidth - this.margin.left - this.margin.right;
    let height = svgHeight - this.margin.top - this.margin.bottom;

    let radius = 10;

    // Create chart group
    let chartGroup = svg.append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
      .classed(".chart", true);

    // Create Axis
    let x = d3.scaleLinear().range([0, width]);
    x.domain([0, d3.max(this._boxes, function(d) {return d.pos})]);
    let xAxis = d3.axisBottom().scale(x)
      .tickValues(Array.from(this._boxes, box => box.pos))
      .tickSize(15)
      .tickFormat(d => {
        // Only show necessary digits
        let floor = Math.floor(d);
        let fixed = d.toFixed(2);
        let lastDigit = fixed.toString().split('').pop();
        if (lastDigit === '0') {
          fixed = d.toFixed(1);
          lastDigit = fixed.toString().split('').pop();
          if (lastDigit === '0')
            fixed = d.toFixed(0);
        }
        return fixed + " km"
      });
    let xAxisEl = chartGroup.append("g")
      .call(xAxis)
      .classed("axis", true);
    xAxisEl.attr("transform", "translate(0," + height + ")")
      .attr("class", "axis");

    // Create circles
    this.createCircles(chartGroup, this._boxes, x);

    let margin = this.margin;
    this.updateVisu = function(newBoxes: any[]) {
      x.domain([0, d3.max(newBoxes, function(d) {return d.pos})]);
      xAxis.scale(x).tickValues(Array.from(newBoxes, box => box.pos));

      chartGroup.select(".axis")
        .call(xAxis);

      chartGroup.selectAll("circle").remove();
      this.createCircles(chartGroup, newBoxes, x);
    }

    this.x = x;
    this.xAxis = xAxis;
    this.margin = margin;
    this.isViewInit = true;
  }

  resizeChart() {
    let svg = d3.select('svg.d3-svg');
    let width = parseFloat(svg.attr("width", '100%').style('width')) - this.margin.left - this.margin.right;
    svg.attr("width", width + this.margin.left + this.margin.right);
    
    this.x.range([0, width]);
    this.xAxis.scale(this.x);
    d3.select(".axis").call(this.xAxis);

    let x = this.x;
    d3.selectAll("circle")
      .data(this._boxes)
      .attr("cx", function(d) {return x(d.pos)});
  }

  createCircles(g, boxes, x) {
    g.selectAll("circle")
      .data(this._boxes)
      .enter()
      .append("circle")
      .attr("r", function(d) {return 10})
      .attr("cx", function(d) {return x(d.pos)})
      .style("fill", function(d) {
        // Restore opacity
        let color = d3.rgb(d.color);
        color.opacity = 1.0;
        return color;
      })
      .on('mouseover', function(d) {
        let currentRadius = d3.select(this).attr("r");

        g.selectAll("circle")
          .attr("r", function(d1) {
            return d.pos === d1.pos ? currentRadius * 1.2 : currentRadius;
          })
          .style("fill-opacity", function(d1) {
            return d.pos === d1.pos ? 1.0 : 0.60;
          });
          g.append("text")
          .attr("x", x(d.pos))
          .attr("y", -currentRadius * 2)
          .text(d.name)
          .classed("tooltip", true)
          .style("text-anchor", "middle");
      })
      .on('mouseout', function(d) { 
        g.selectAll(".tooltip").remove();
        g.selectAll("circle")
          .style("fill-opacity", 1.0)
          .attr("r", function(d1) {
            let currentRadius = d3.select(this).attr("r");
            return d.pos === d1.pos ? currentRadius / 1.2 : currentRadius;
          });
      });
  }
}
