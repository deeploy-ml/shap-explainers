import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { each, debounce, sortBy } from 'lodash';
import * as d3 from 'd3';

import { InfluenceData } from '../shap-data';

@Component({
  selector: 'shap-influence',
  templateUrl: './shap-influence.component.html',
  styleUrls: ['./shap-influence.component.scss'],
})
export class ShapInfluenceComponent implements AfterViewInit {
  @Input() influenceColors: string[] = [
    'rgb(222, 53, 13)',
    'rgb(111, 207, 151)',
  ];
  @Input() predictions: number[] = [1];
  @Input() predictionNames: string[] = ['Income'];
  @Input() labelAmount: number = 7;

  @Input() data: InfluenceData = {
    featureNames: {
      '0': 'age',
      '1': 'workClass',
      '2': 'education',
      '3': 'maritualStatus',
      '4': 'occupation',
      '5': 'relationship',
      '6': 'race',
      '7': 'sex',
      '8': 'capitalGain',
      '9': 'capitalLoss',
      '10': 'hoursPerWeek',
      '11': 'nativeCountry',
    },
    valueNames: {
      '0': '50',
      '1': 'Middle',
      '2': 'Bachelor of Science',
      '3': 'Married',
      '4': 'Engineer',
      '5': 'Yes',
      '6': 'Dutch',
      '7': 'Female',
      '8': '12250',
      '9': '500',
      '10': '50',
      '11': 'Australia',
    },
    features: {
      '0': { value: 50, effect: 0.009206349206349593 },
      '1': { value: 0, effect: -0.03126984126984064 },
      '2': { value: 13, effect: 0.024285714285714452 },
      '3': { value: 2, effect: 0 },
      '4': { value: 4, effect: 0.04214285714285741 },
      '5': { value: 1, effect: -0.08801587301587223 },
      '6': { value: 0, effect: -0.028888888888888298 },
      '7': { value: 1, effect: 0 },
      '8': { value: 12250, effect: 0.8580158730158687 },
      '9': { value: 500, effect: -0.14198412698412655 },
      '10': { value: 50, effect: 0.00047619047619129606 },
      '11': { value: 40, effect: -0.04396825396825377 },
    },
  };

  @Output() isLoaded = new EventEmitter();

  private readonly PREDICTION_GROUP_HEIGHT = 35;
  private readonly MARGIN = 20;
  private readonly OFFSET_Y = 20;
  private readonly LABEL_HEIGHT = 20;
  private readonly BINS = 6;

  private svg: d3.Selection<d3.BaseType, {}, HTMLElement, any>;
  private labelGroup: d3.Selection<SVGGElement, {}, d3.BaseType, any>;
  private influenceGroup: d3.Selection<SVGGElement, {}, d3.BaseType, any>;
  private importantFactors: d3.Selection<SVGGElement, {}, d3.BaseType, any>;
  private predictionGroup: d3.Selection<SVGGElement, {}, d3.BaseType, any>;

  private labels: d3.Selection<SVGGElement, {}, d3.BaseType, any>[] = [];
  private influences: d3.Selection<SVGGElement, {}, d3.BaseType, any>[] = [];
  private predictionLabels: d3.Selection<SVGGElement, {}, d3.BaseType, any>[] =
    [];
  private predictionValues: d3.Selection<SVGGElement, {}, d3.BaseType, any>[] =
    [];

  private redraw: any;

  constructor() {
    this.redraw = debounce(() => this.draw(), 200);
  }

  ngAfterViewInit(): void {
    this.svg = d3.select('#influence');

    this.predictionGroup = this.svg.append('g');
    this.importantFactors = this.svg.append('text');
    this.labelGroup = this.svg.append('g');
    this.influenceGroup = this.svg.append('g');

    each(this.data.featureNames, () => {
      this.labels.push(this.labelGroup.append('text'));
      this.influences.push(this.influenceGroup.append('text'));
    });

    each(this.predictions, () => {
      this.predictionLabels.push(this.predictionGroup.append('text'));
      this.predictionValues.push(this.predictionGroup.append('text'));
    });

    window.addEventListener('resize', this.redraw);
    window.setTimeout(this.redraw, 50);
  }

  public draw(): any {
    const predictionHeight = this.PREDICTION_GROUP_HEIGHT + this.MARGIN;
    const predictionAmount = this.predictions.length;
    const featureLabelsOffset =
      predictionHeight * predictionAmount + this.MARGIN;

    this.calculatePlusMinus(this.BINS);

    const data = sortBy(
      this.data.features,
      (feature) => 1 / Math.abs(feature.effect)
    );

    this.importantFactors
      .attr('x', 0)
      .attr('y', featureLabelsOffset)
      .attr('font-size', '14')
      .attr('font-weight', 'bold')
      .attr('fill', '#000000')
      .text('Important factors');

    each(this.predictions, (prediction, i) => {
      this.predictionLabels[i]
        .attr('x', 0)
        .attr('y', this.OFFSET_Y + i * predictionHeight)
        .attr('font-size', '14')
        .attr('font-weight', 'bold')
        .attr('fill', '#000000')
        .text(this.predictionNames[i]);

      this.predictionValues[i]
        .attr('x', 0)
        .attr('y', this.OFFSET_Y + i * predictionHeight + this.LABEL_HEIGHT)
        .attr('font-size', '14')
        .attr('fill', '#000000')
        .text(prediction);
    });

    each(data, (feature, i) => {
      if (i < this.labelAmount) {
        const result = feature.name.replace(/([A-Z])/g, ' $1');
        const name = result.charAt(0).toUpperCase() + result.slice(1);

        this.labels[i]
          .attr('x', 0)
          .attr('y', featureLabelsOffset + this.LABEL_HEIGHT * i + this.MARGIN)
          .attr('font-size', '14')
          .attr('fill', '#000000')
          .text(`${name}: ${feature.valueName}`);

        this.influences[i]
          .attr('x', 200)
          .attr('y', featureLabelsOffset + this.LABEL_HEIGHT * i + this.MARGIN)
          .attr('font-size', '14')
          .attr('font-weight', 'bold')
          .attr(
            'fill',
            feature.binDistance < 0
              ? this.influenceColors[0]
              : this.influenceColors[1]
          )
          .text(this.plusMinusLabel(feature.binDistance));
      }
    });

    this.setScaledDimentions();
    this.isLoaded.emit();
  }

  private setScaledDimentions(): void {
    const totalHeight =
      this.predictionGroup.node().getBBox().height +
      this.influenceGroup.node().getBBox().height +
      this.importantFactors.node().getBBox().height +
      this.MARGIN * 2;
    const totalWidth =
      this.getMaxSize('width', this.influences) +
      this.getMaxSize('width', this.labels) +
      this.MARGIN;

    each(this.influences, (influence) => {
      influence.attr('x', this.getMaxSize('width', this.labels) + this.MARGIN);
    });

    this.svg.attr('height', totalHeight).attr('width', totalWidth);

    each(this.predictionLabels, (predictionLabel) => {
      const leftOffset =
        this.svg.node().getBBox().width / 2 -
        predictionLabel.node().getBBox().width / 2;
      predictionLabel.attr('x', leftOffset);
    });

    each(this.predictionValues, (predictionValue) => {
      const leftOffset =
        this.svg.node().getBBox().width / 2 -
        predictionValue.node().getBBox().width / 2;
      predictionValue.attr('x', leftOffset);
    });
  }

  private calculatePlusMinus(amountOfBins: number): void {
    each(this.data.featureNames, (name, i) => {
      if (this.data.features[i]) this.data.features[i].name = name;
    });

    each(this.data.valueNames, (valueName, i) => {
      if (this.data.features[i]) this.data.features[i].valueName = valueName;
    });

    const minEffect = Math.min(
      ...Object.values(this.data.features).map((feature) => feature.effect)
    );
    const maxEffect = Math.max(
      ...Object.values(this.data.features).map((feature) => feature.effect)
    );
    let binMin = minEffect;
    let binMax: number;
    let bins: { min: number; max: number; distance: number }[] = [];
    let binFlipPoint = amountOfBins / 2;

    for (let i = 0; i < amountOfBins; i++) {
      let distance: number;

      if (i < binFlipPoint) {
        distance = i - binFlipPoint;
        binMax = binMin + Math.abs(minEffect) / binFlipPoint;
      } else {
        distance = i - binFlipPoint + 1;
        binMax = distance * (maxEffect / binFlipPoint);
      }

      bins.push({ min: binMin, max: binMax, distance: distance });
      binMin = binMax;
    }

    each(this.data.features, (feature, i) => {
      bins.forEach((bin) => {
        if (feature.effect >= bin.min && feature.effect <= bin.max) {
          this.data.features[i].binDistance = bin.distance;
        }
      });
    });
  }

  private plusMinusLabel(binDistance: number): string {
    if (binDistance >= 0) {
      let plusses = [];
      for (let i = 0; i < binDistance; i++) {
        plusses.push('+');
      }
      return plusses.join(' ');
    } else {
      let minusses = [];
      for (let i = 0; i < Math.abs(binDistance); i++) {
        minusses.push('-');
      }
      return minusses.join(' ');
    }
  }

  private getMaxSize(
    size: 'width' | 'height',
    array: d3.Selection<SVGGElement, {}, d3.BaseType, any>[]
  ): number {
    return Math.max(...array.map((object) => object.node().getBBox()[size]));
  }
}
