import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { select } from 'd3-selection';
import { scaleLinear, scaleTime } from 'd3-scale';
import { format } from 'd3-format';
import { axisBottom, axisLeft } from 'd3-axis';
import { line } from 'd3-shape';
import { hsl, HSLColor } from 'd3-color';
import {
  sortBy,
  min,
  max,
  map,
  each,
  sum,
  filter,
  debounce,
  keys,
  range,
  rangeRight,
  cloneDeep,
  findKey,
} from 'lodash';
import * as d3 from 'd3';

import { ShapColors } from './shap-colors';
import { AdditiveForceArrayData } from './shap-data';
import { timeFormat, timeParse } from 'd3';

@Component({
  selector: 'app-shap-additive-force-array',
  templateUrl: './shap-additive-force-array.component.html',
  styleUrls: ['./shap-additive-force-array.component.scss'],
})
export class ShapAdditiveForceArrayComponent implements AfterViewInit, OnDestroy {
  @Input() orderingKeys;
  @Input() orderKeysTimeFormat;
  @Input() topOffset: number = 28;
  @Input() leftOffset: number = 80;
  @Input() rightOffset: number = 10;
  @Input() height: number = 350;
  @Input() link: 'identity' | 'logit' = 'identity';
  @Input() baseValue: number = 10;
  @Input() data: AdditiveForceArrayData = {
    baseValue: 0.0,
    link: 'identity',
    featureNames: {
      0: 'Blue',
      1: 'Red',
      2: 'Green',
      3: 'Orange',
    },
    outNames: ['color rating'],
    explanations: [
      {
        outValue: -1.5,
        simIndex: 1,
        features: {
          0: { value: 1.0, effect: 1.0 },
          1: { value: 0.0, effect: 0.5 },
          2: { value: 2.0, effect: -2.5 },
          3: { value: 2.0, effect: -0.5 },
        },
      },
      {
        outValue: -0.5,
        simIndex: 0,
        features: {
          0: { value: 1.0, effect: 1.0 },
          1: { value: 0.0, effect: 0.5 },
          2: { value: 1.0, effect: -1.5 },
          3: { value: 2.0, effect: -0.5 },
        },
      },
      {
        outValue: 0,
        simIndex: 2,
        features: {
          0: { value: 1.5, effect: 1.5 },
          1: { value: 0.0, effect: 0.5 },
          2: { value: 1.0, effect: -1.5 },
          3: { value: 2.0, effect: -0.5 },
        },
      },
    ],
  };

  // TODO: Changed SVGElement to any
  private svg: d3.Selection<any, {}, HTMLElement, any>;
  private wrapper: d3.Selection<any, {}, HTMLElement, any>;
  private mainGroup: d3.Selection<SVGGElement, {}, d3.BaseType, any>;
  private onTopGroup: d3.Selection<SVGGElement, {}, d3.BaseType, any>;
  private colors: any[];
  private brighterColors: HSLColor[];

  private xaxisElement: d3.Selection<SVGGElement, {}, d3.BaseType, any>;
  private yaxisElement: d3.Selection<SVGGElement, {}, d3.BaseType, any>;
  private hoverGroup1: d3.Selection<SVGGElement, {}, d3.BaseType, any>;
  private hoverGroup2: d3.Selection<SVGGElement, {}, d3.BaseType, any>;
  private hoverLine: d3.Selection<SVGGElement, {}, d3.BaseType, any>;
  private hoverxOutline: d3.Selection<SVGGElement, {}, d3.BaseType, any>;
  private hoveryOutline: d3.Selection<SVGGElement, {}, d3.BaseType, any>;
  private hoverx: d3.Selection<SVGGElement, {}, d3.BaseType, any>;
  private hovery: d3.Selection<SVGGElement, {}, d3.BaseType, any>;
  private hoverxTitle: d3.Selection<SVGGElement, {}, d3.BaseType, any>;
  private hoveryTitle: d3.Selection<SVGGElement, {}, d3.BaseType, any>;
  private baseValueTitle: d3.Selection<SVGGElement, {}, d3.BaseType, any>;

  // TODO: Changed SVGElement to any
  private xlabel: d3.Selection<any, {}, d3.BaseType, any>;

  // TODO: Changed SVGElement to any
  private ylabel: d3.Selection<any, {}, d3.BaseType, any>;

  // TODO: Changed SVGElement to any
  // private xscale: d3.ScaleLinear<number, number, never> | d3.ScaleTime<number, number, number>;
  private xscale;
  private xaxis: d3.Axis<d3.AxisDomain>;
  private yscale: d3.ScaleLinear<number, number, never>;
  private yaxis: d3.Axis<d3.AxisDomain>;
  private currExplanations;
  private usedFeatures;
  private posOrderedFeatures;
  private negOrderedFeatures;
  private singleValueFeatures;
  private currUsedFeatures;
  private nearestExpIndex;
  private currPosOrderedFeatures;
  private currNegOrderedFeatures;
  private predValues;
  private explanations;

  effectFormat: (n: number | { valueOf(): number }) => string;
  redraw: any;
  invLinkFunction: Function;
  tickFormat: (
    n:
      | number
      | {
          valueOf(): number;
        },
  ) => string;
  parseTime: (dateString: string) => Date;
  formatTime: (dateString: Date) => string;
  xtickFormat: (x: any) => any;
  ytickFormat: (x: any) => any;

  constructor() {
    this.effectFormat = format('.2');
    this.redraw = debounce(() => this.draw(null), 200);
  }

  ngAfterViewInit(): void {
    this.svg = d3.select('svg');
    this.wrapper = d3.select('#wrapper');

    console.log(this.wrapper.node());
    this.mainGroup = this.svg.append('g');
    this.onTopGroup = this.svg.append('g');
    this.xaxisElement = this.onTopGroup
      .append('g')
      .attr('transform', 'translate(0,35)')
      .attr('class', 'force-bar-array-xaxis');
    this.yaxisElement = this.onTopGroup
      .append('g')
      .attr('transform', 'translate(0,35)')
      .attr('class', 'force-bar-array-yaxis');
    this.hoverGroup1 = this.svg.append('g');
    this.hoverGroup2 = this.svg.append('g');
    this.baseValueTitle = this.svg.append('text');
    this.hoverLine = this.svg.append('line');
    this.hoverxOutline = this.svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .attr('stroke', '#fff')
      .attr('stroke-width', '6')
      .attr('font-size', '12px');
    this.hoverx = this.svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .attr('fill', '#000')
      .attr('font-size', '12px');
    this.hoverxTitle = this.svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('opacity', 0.6)
      .attr('font-size', '12px');
    this.hoveryOutline = this.svg
      .append('text')
      .attr('text-anchor', 'end')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .attr('stroke', '#fff')
      .attr('stroke-width', '6')
      .attr('font-size', '12px');
    this.hovery = this.svg
      .append('text')
      .attr('text-anchor', 'end')
      .attr('font-weight', 'bold')
      .attr('fill', '#000')
      .attr('font-size', '12px');

    console.log(this.svg.node());

    this.xlabel = this.wrapper.select('.additive-force-array-xlabel').attr('font-size', '14px');
    this.ylabel = this.wrapper.select('.additive-force-array-ylabel');

    // Create our colors and color gradients
    //Verify custom color map
    let plot_colors = ShapColors.colors.deeploy;

    this.colors = plot_colors.map(x => hsl(x));
    this.brighterColors = [1.45, 1.6].map((v, i) => this.colors[i].brighter(v));

    // create our axes
    let defaultFormat = format(',.4');
    if (this.orderingKeys != null && this.orderKeysTimeFormat != null) {
      this.parseTime = timeParse(this.orderKeysTimeFormat);
      this.formatTime = timeFormat(this.orderKeysTimeFormat);

      function condFormat(x) {
        if (typeof x == 'object') {
          return this.formatTime(x);
        } else {
          return defaultFormat(x);
        }
      }

      this.xtickFormat = condFormat;
    } else {
      this.parseTime = null;
      this.formatTime = null;
      this.xtickFormat = defaultFormat;
    }
    this.xscale = scaleLinear();
    this.xaxis = axisBottom(this.xscale)
      .tickSizeInner(4)
      .tickSizeOuter(0)
      .tickFormat(d => this.xtickFormat(d))
      .tickPadding(-18);

    this.ytickFormat = defaultFormat;
    this.yscale = scaleLinear();
    this.yaxis = axisLeft(this.yscale)
      .tickSizeInner(4)
      .tickSizeOuter(0)
      .tickFormat(d => this.ytickFormat(this.invLinkFunction(d)))
      .tickPadding(2);

    console.log(this.xlabel.node());
    this.xlabel.node().onchange = () => this.internalDraw();
    this.ylabel.node().onchange = () => this.internalDraw();

    this.svg.on('mousemove', x => this.mouseMoved(x));
    this.svg.on('mouseout', x => this.mouseOut(x));

    // draw and then listen for resize events
    //this.draw();
    window.addEventListener('resize', this.redraw);
    window.setTimeout(this.redraw, 50); // re-draw after interface has updated
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.redraw);
  }

  draw(explanations) {
    if (!this.data.explanations || this.data.explanations.length === 0) return;

    // record the order in which the explanations were given
    each(this.data.explanations, (x, i) => (x.origInd = i));

    // Find what features are actually used
    let posDefinedFeatures = {};
    let negDefinedFeatures = {};
    let definedFeaturesValues = {};
    for (let e of this.data.explanations) {
      for (let k in e.features) {
        if (posDefinedFeatures[k] === undefined) {
          posDefinedFeatures[k] = 0;
          negDefinedFeatures[k] = 0;
          definedFeaturesValues[k] = 0;
        }
        if (e.features[k].effect > 0) {
          posDefinedFeatures[k] += e.features[k].effect;
        } else {
          negDefinedFeatures[k] -= e.features[k].effect;
        }
        if (e.features[k].value !== null && e.features[k].value !== undefined) {
          definedFeaturesValues[k] += 1;
        }
      }
    }
    this.usedFeatures = sortBy(keys(posDefinedFeatures), i => -(posDefinedFeatures[i] + negDefinedFeatures[i]));
    console.log('found ', this.usedFeatures.length, ' used features');

    this.posOrderedFeatures = sortBy(this.usedFeatures, i => posDefinedFeatures[i]);
    this.negOrderedFeatures = sortBy(this.usedFeatures, i => -negDefinedFeatures[i]);
    this.singleValueFeatures = filter(this.usedFeatures, i => definedFeaturesValues[i] > 0);

    let options: any = [
      'sample order by similarity',
      'sample order by output value',
      'original sample ordering',
    ].concat(this.singleValueFeatures.map(i => this.data.featureNames[i]));
    if (this.orderingKeys != null) {
      options.unshift('sample order by key');
    }

    let xLabelOptions: d3.Selection<any, any, SVGGElement, {}> = this.xlabel.selectAll('option').data(options);
    xLabelOptions
      .enter()
      .append('option')
      .merge(xLabelOptions)
      .attr('value', d => d)
      .text(d => d);
    xLabelOptions.exit().remove();

    let n = this.data.outNames[0] ? this.data.outNames[0] : 'model output value';
    options = map(this.usedFeatures, i => [this.data.featureNames[i], this.data.featureNames[i] + ' effects']);

    // TODO: Changed array
    console.log(options);
    options.unshift(['model output value', n]);
    let yLabelOptions: d3.Selection<any, any, SVGGElement, {}> = this.ylabel.selectAll('option').data(options);
    yLabelOptions
      .enter()
      .append('option')
      .merge(yLabelOptions)
      .attr('value', d => d[0])
      .text(d => d[1]);
    yLabelOptions.exit().remove();

    console.log(this.height);
    this.ylabel
      .style('top', (this.height - 38 - this.topOffset) / 2 + this.topOffset + 'px')
      .style('left', 10 - this.ylabel.node().offsetWidth / 2 + 'px');

    console.log(10 - this.svg.node().offsetWidth / 2);
    this.xlabel
      .style('position', 'absolute')
      .style('left', this.wrapper.node().offsetWidth / 2 - this.xlabel.node().offsetWidth / 2 + 'px');

    this.internalDraw();
  }

  internalDraw() {
    // we fill in any implicit feature values and assume they have a zero effect and value
    for (let e of this.data.explanations) {
      for (let i of this.usedFeatures) {
        if (!e.features.hasOwnProperty(i)) {
          e.features[i] = { effect: 0, value: 0 };
        }
        e.features[i].ind = i;
      }
    }

    let explanations: any;
    let xsort = this.xlabel.node().value;

    // Set scaleTime if time ticks provided for original ordering
    let isTimeScale = xsort === 'sample order by key' && this.orderKeysTimeFormat != null;
    if (isTimeScale) {
      this.xscale = scaleTime();
    } else {
      this.xscale = scaleLinear();
    }
    this.xaxis.scale(this.xscale);

    if (xsort === 'sample order by similarity') {
      explanations = sortBy(this.data.explanations, x => x.simIndex);
      each(explanations, (e, i) => (e.xmap = i));
    } else if (xsort === 'sample order by output value') {
      explanations = sortBy(this.data.explanations, x => -x.outValue);
      each(explanations, (e, i) => (e.xmap = i));
    } else if (xsort === 'original sample ordering') {
      explanations = sortBy(this.data.explanations, x => x.origInd);
      each(explanations, (e, i) => (e.xmap = i));
    } else if (xsort === 'sample order by key') {
      explanations = this.data.explanations;
      if (isTimeScale) {
        each(explanations, (e, i) => (e.xmap = this.parseTime(this.orderingKeys[i])));
      } else {
        each(explanations, (e, i) => (e.xmap = this.orderingKeys[i]));
      }
      explanations = sortBy(explanations, e => e.xmap);
    } else {
      let ind = findKey(this.data.featureNames, x => x === xsort);

      console.log(ind);

      each(this.data.explanations, (e, i) => {
        console.log(e, i);
        e.xmap = e.features[ind].value;
      });
      let explanations2 = sortBy(this.data.explanations, x => x.xmap);
      let xvals = map(explanations2, x => x.xmap);
      if (typeof xvals[0] == 'string') {
        alert('Ordering by category names is not yet supported.');
        return;
      }
      let xmin = min(xvals);
      let xmax = max(xvals);
      let binSize = (xmax - xmin) / 100;

      // Build explanations where effects are averaged when the x values are identical
      explanations = [];
      let laste, copye;
      for (let i = 0; i < explanations2.length; ++i) {
        let e = explanations2[i];
        if ((laste && !copye && e.xmap - laste.xmap <= binSize) || (copye && e.xmap - copye.xmap <= binSize)) {
          if (!copye) {
            copye = cloneDeep(laste);
            copye.count = 1;
          }
          for (let j of this.usedFeatures) {
            copye.features[j].effect += e.features[j].effect;
            copye.features[j].value += e.features[j].value;
          }
          copye.count += 1;
        } else if (laste) {
          if (copye) {
            for (let j of this.usedFeatures) {
              copye.features[j].effect /= copye.count;
              copye.features[j].value /= copye.count;
            }
            explanations.push(copye);
            copye = undefined;
          } else {
            explanations.push(laste);
          }
        }
        laste = e;
      }
      console.log('explanations', explanations);
      if (laste.xmap - explanations[explanations.length - 1].xmap > binSize) {
        explanations.push(laste);
      }
      console.log('explanations', explanations);
    }

    // adjust for the correct y-value we are plotting
    this.currUsedFeatures = this.usedFeatures;
    this.currPosOrderedFeatures = this.posOrderedFeatures;
    this.currNegOrderedFeatures = this.negOrderedFeatures;
    //let filteredFeatureNames = this.data.featureNames;

    let yvalue = this.ylabel.node().value;
    console.log('1: explanations', explanations);
    if (yvalue !== 'model output value') {
      let olde = explanations;
      explanations = cloneDeep(explanations); // TODO: add pointer from old explanations which is prop.explanations to new ones
      let ind = findKey(this.data.featureNames, x => x === yvalue);

      for (let i = 0; i < explanations.length; ++i) {
        let v = explanations[i].features[ind];
        explanations[i].features = {};
        explanations[i].features[ind] = v;
        olde[i].remapped_version = explanations[i];
      }
      //filteredFeatureNames = [this.data.featureNames[ind]];
      this.currUsedFeatures = [ind];
      this.currPosOrderedFeatures = [ind];
      this.currNegOrderedFeatures = [ind];
    }
    this.currExplanations = explanations;

    // determine the link function
    if (this.link === 'identity') {
      // assume all links are the same
      this.invLinkFunction = x => this.baseValue + x;
    } else if (this.link === 'logit') {
      this.invLinkFunction = x => 1 / (1 + Math.exp(-(this.baseValue + x))); // logistic is inverse of logit
    } else {
      console.log('ERROR: Unrecognized link function: ', this.link);
    }

    console.log(explanations);
    this.predValues = map(explanations, e => sum(map(e.features, x => x.effect)));

    let width = this.wrapper.node().offsetWidth;
    if (width == 0) return setTimeout(() => this.draw(explanations), 500);

    this.svg.style('height', this.height + 'px');
    this.svg.style('width', width + 'px');

    let xvals = map(explanations, x => x.xmap);
    this.xscale
      .domain([min(xvals), max(xvals)])
      .range([this.leftOffset, width - this.rightOffset])
      .clamp(true);
    this.xaxisElement.attr('transform', 'translate(0,' + this.topOffset + ')').call(this.xaxis);

    for (let i = 0; i < this.currExplanations.length; ++i) {
      this.currExplanations[i].xmapScaled = this.xscale(this.currExplanations[i].xmap);
    }

    let N = explanations.length;
    let domainSize = 0;
    for (let ind = 0; ind < N; ++ind) {
      let data2 = explanations[ind].features;
      //if (data2.length !== P) error("Explanations have differing numbers of features!");
      let totalPosEffects =
        sum(
          map(
            filter(data2, x => x.effect > 0),
            x => x.effect,
          ),
        ) || 0;
      let totalNegEffects =
        sum(
          map(
            filter(data2, x => x.effect < 0),
            x => -x.effect,
          ),
        ) || 0;
      domainSize = Math.max(domainSize, Math.max(totalPosEffects, totalNegEffects) * 2.2);
    }
    this.yscale.domain([-domainSize / 2, domainSize / 2]).range([this.height - 10, this.topOffset]);
    this.yaxisElement.attr('transform', 'translate(' + this.leftOffset + ',0)').call(this.yaxis);

    for (let ind = 0; ind < N; ++ind) {
      let data2 = explanations[ind].features;
      //console.log(length(data2))

      let totalNegEffects =
        sum(
          map(
            filter(data2, x => x.effect < 0),
            x => -x.effect,
          ),
        ) || 0;

      //let scaleOffset = height/2 - this.yscale(totalNegEffects);

      // calculate the position of the join point between positive and negative effects
      // and also the positions of each feature effect block
      let pos = -totalNegEffects,
        i;
      for (i of this.currPosOrderedFeatures) {
        data2[i].posyTop = this.yscale(pos);
        if (data2[i].effect > 0) pos += data2[i].effect;
        data2[i].posyBottom = this.yscale(pos);
        data2[i].ind = i;
      }
      let joinPoint = pos;
      for (i of this.currNegOrderedFeatures) {
        data2[i].negyTop = this.yscale(pos);
        if (data2[i].effect < 0) pos -= data2[i].effect;
        data2[i].negyBottom = this.yscale(pos);
      }
      explanations[ind].joinPoint = joinPoint;
      explanations[ind].joinPointy = this.yscale(joinPoint);
    }

    let lineFunction = line()
      .x(d => d[0])
      .y(d => d[1]);

    let areasPos: d3.Selection<any, unknown, SVGGElement, {}> = this.mainGroup
      .selectAll('.force-bar-array-area-pos')
      .data(this.currUsedFeatures);
    areasPos
      .enter()
      .append('path')
      .attr('class', 'force-bar-array-area-pos')
      .merge(areasPos)
      .attr('d', (i: number) => {
        let topPoints = map(range(N), j => [explanations[j].xmapScaled, explanations[j].features[i].posyTop]);
        let bottomPoints = map(rangeRight(N), j => [
          explanations[j].xmapScaled,
          explanations[j].features[i].posyBottom,
        ]);
        return lineFunction(topPoints.concat(bottomPoints));
      })
      .attr('fill', this.colors[0]);
    areasPos.exit().remove();

    let areasNeg: d3.Selection<any, unknown, SVGGElement, {}> = this.mainGroup
      .selectAll('.force-bar-array-area-neg')
      .data(this.currUsedFeatures);
    areasNeg
      .enter()
      .append('path')
      .attr('class', 'force-bar-array-area-neg')
      .merge(areasNeg)
      .attr('d', (i: number) => {
        let topPoints = map(range(N), j => [explanations[j].xmapScaled, explanations[j].features[i].negyTop]);
        let bottomPoints = map(rangeRight(N), j => [
          explanations[j].xmapScaled,
          explanations[j].features[i].negyBottom,
        ]);
        return lineFunction(topPoints.concat(bottomPoints));
      })
      .attr('fill', this.colors[1]);
    areasNeg.exit().remove();

    let dividersPos: d3.Selection<any, unknown, SVGGElement, {}> = this.mainGroup
      .selectAll('.force-bar-array-divider-pos')
      .data(this.currUsedFeatures);
    dividersPos
      .enter()
      .append('path')
      .attr('class', 'force-bar-array-divider-pos')
      .merge(dividersPos)
      .attr('d', (i: number) => {
        let points = map(range(N), j => [explanations[j].xmapScaled, explanations[j].features[i].posyBottom]);
        return lineFunction(points);
      })
      .attr('fill', 'none')
      .attr('stroke-width', 1)
      .attr('stroke', () => this.colors[0].brighter(1.2));
    dividersPos.exit().remove();

    let dividersNeg: d3.Selection<any, unknown, SVGGElement, {}> = this.mainGroup
      .selectAll('.force-bar-array-divider-neg')
      .data(this.currUsedFeatures);
    dividersNeg
      .enter()
      .append('path')
      .attr('class', 'force-bar-array-divider-neg')
      .merge(dividersNeg)
      .attr('d', (i: number) => {
        let points = map(range(N), j => [explanations[j].xmapScaled, explanations[j].features[i].negyTop]);
        return lineFunction(points);
      })
      .attr('fill', 'none')
      .attr('stroke-width', 1)
      .attr('stroke', () => this.colors[1].brighter(1.5));
    dividersNeg.exit().remove();

    let boxBounds = function(es, ind, starti, endi, featType) {
      let maxTop, minBottom;
      if (featType === 'pos') {
        maxTop = es[starti].features[ind].posyBottom;
        minBottom = es[starti].features[ind].posyTop;
      } else {
        maxTop = es[starti].features[ind].negyBottom;
        minBottom = es[starti].features[ind].negyTop;
      }
      let t, b;
      for (let i = starti + 1; i <= endi; ++i) {
        if (featType === 'pos') {
          t = es[i].features[ind].posyBottom;
          b = es[i].features[ind].posyTop;
        } else {
          t = es[i].features[ind].negyBottom;
          b = es[i].features[ind].negyTop;
        }
        if (t > maxTop) maxTop = t;
        if (b < minBottom) minBottom = b;
      }
      return { top: maxTop, bottom: minBottom };
    };

    let neededWidth = 100;
    let neededHeight = 20;
    let neededBuffer = 100;

    // find areas on the plot big enough for feature labels
    let featureLabels = [];
    for (let featType of ['pos', 'neg']) {
      for (let ind of this.currUsedFeatures) {
        let starti = 0,
          endi = 0,
          boxWidth = 0,
          hbounds = { top: 0, bottom: 0 };
        let newHbounds;
        while (endi < N - 1) {
          // make sure our box is long enough
          while (boxWidth < neededWidth && endi < N - 1) {
            ++endi;
            boxWidth = explanations[endi].xmapScaled - explanations[starti].xmapScaled;
          }

          // and high enough
          hbounds = boxBounds(explanations, ind, starti, endi, featType);
          while (hbounds.bottom - hbounds.top < neededHeight && starti < endi) {
            ++starti;
            hbounds = boxBounds(explanations, ind, starti, endi, featType);
          }
          boxWidth = explanations[endi].xmapScaled - explanations[starti].xmapScaled;

          // we found a spot!
          if (hbounds.bottom - hbounds.top >= neededHeight && boxWidth >= neededWidth) {
            //console.log(`found a spot! ind: ${ind}, starti: ${starti}, endi: ${endi}, hbounds:`, hbounds)
            // make our box as long as possible
            while (endi < N - 1) {
              ++endi;
              newHbounds = boxBounds(explanations, ind, starti, endi, featType);
              if (newHbounds.bottom - newHbounds.top > neededHeight) {
                hbounds = newHbounds;
              } else {
                --endi;
                break;
              }
            }
            boxWidth = explanations[endi].xmapScaled - explanations[starti].xmapScaled;
            //console.log("found  ",boxWidth,hbounds)

            featureLabels.push([
              (explanations[endi].xmapScaled + explanations[starti].xmapScaled) / 2,
              (hbounds.top + hbounds.bottom) / 2,
              this.data.featureNames[ind],
            ]);

            let lastEnd = explanations[endi].xmapScaled;
            starti = endi;
            while (lastEnd + neededBuffer > explanations[starti].xmapScaled && starti < N - 1) {
              ++starti;
            }
            endi = starti;
          }
        }
      }
    }

    let featureLabelText: d3.Selection<any, unknown, SVGGElement, {}> = this.onTopGroup
      .selectAll('.force-bar-array-flabels')
      .data(featureLabels);
    featureLabelText
      .enter()
      .append('text')
      .attr('class', 'force-bar-array-flabels')
      .merge(featureLabelText)
      .attr('x', d => d[0])
      .attr('y', d => d[1] + 4)
      .text(d => d[2]);
    featureLabelText.exit().remove();
  }

  mouseOut(x) {
    this.hoverLine.attr('display', 'none');
    this.hoverx.attr('display', 'none');
    this.hoverxOutline.attr('display', 'none');
    this.hoverxTitle.attr('display', 'none');
    this.hovery.attr('display', 'none');
    this.hoveryOutline.attr('display', 'none');
    this.hoverGroup1.attr('display', 'none');
    this.hoverGroup2.attr('display', 'none');
  }

  mouseMoved(x) {
    let i, nearestExp;

    this.hoverLine.attr('display', '');
    this.hoverx.attr('display', '');
    this.hoverxOutline.attr('display', '');
    this.hoverxTitle.attr('display', '');
    this.hovery.attr('display', '');
    this.hoveryOutline.attr('display', '');
    this.hoverGroup1.attr('display', '');
    this.hoverGroup2.attr('display', '');

    // let x = mouse(this.svg.node())[0];

    if (this.data.explanations) {
      // Find the nearest explanation to the cursor position
      for (i = 0; i < this.currExplanations.length; ++i) {
        if (!nearestExp || Math.abs(nearestExp.xmapScaled - x) > Math.abs(this.currExplanations[i].xmapScaled - x)) {
          nearestExp = this.currExplanations[i];
        }
      }
      this.nearestExpIndex = nearestExp.origInd;

      this.hoverLine
        .attr('x1', nearestExp.xmapScaled)
        .attr('x2', nearestExp.xmapScaled)
        .attr('y1', 0 + this.topOffset)
        .attr('y2', this.height);
      this.hoverx
        .attr('x', nearestExp.xmapScaled)
        .attr('y', this.topOffset - 5)
        .text(this.xtickFormat(nearestExp.xmap));
      this.hoverxOutline
        .attr('x', nearestExp.xmapScaled)
        .attr('y', this.topOffset - 5)
        .text(this.xtickFormat(nearestExp.xmap));
      this.hoverxTitle
        .attr('x', nearestExp.xmapScaled)
        .attr('y', this.topOffset - 18)
        .text(nearestExp.count > 1 ? nearestExp.count + ' averaged samples' : '');
      this.hovery
        .attr('x', this.leftOffset - 6)
        .attr('y', nearestExp.joinPointy)
        .text(this.ytickFormat(this.invLinkFunction(nearestExp.joinPoint)));
      this.hoveryOutline
        .attr('x', this.leftOffset - 6)
        .attr('y', nearestExp.joinPointy)
        .text(this.ytickFormat(this.invLinkFunction(nearestExp.joinPoint)));

      let posFeatures = [];
      let lastPos, pos;
      for (let j = this.currPosOrderedFeatures.length - 1; j >= 0; --j) {
        let i = this.currPosOrderedFeatures[j];
        let d = nearestExp.features[i];
        pos = 5 + (d.posyTop + d.posyBottom) / 2;
        if ((!lastPos || pos - lastPos >= 15) && d.posyTop - d.posyBottom >= 6) {
          posFeatures.push(d);
          lastPos = pos;
        }
      }

      let negFeatures = [];
      lastPos = undefined;
      for (let i of this.currNegOrderedFeatures) {
        let d = nearestExp.features[i];
        pos = 5 + (d.negyTop + d.negyBottom) / 2;
        if ((!lastPos || lastPos - pos >= 15) && d.negyTop - d.negyBottom >= 6) {
          negFeatures.push(d);
          lastPos = pos;
        }
      }

      let labelFunc = d => {
        let valString = '';
        if (d.value !== null && d.value !== undefined) {
          valString = ' = ' + (isNaN(d.value) ? d.value : this.ytickFormat(d.value));
        }
        if (nearestExp.count > 1) {
          return 'mean(' + this.data.featureNames[d.ind] + ')' + valString;
        } else {
          return this.data.featureNames[d.ind] + valString;
        }
      };

      let featureHoverLabels1: d3.Selection<any, any, SVGGElement, {}> = this.hoverGroup1
        .selectAll('.pos-values')
        .data(posFeatures);
      featureHoverLabels1
        .enter()
        .append('text')
        .attr('class', 'pos-values')
        .merge(featureHoverLabels1)
        .attr('x', nearestExp.xmapScaled + 5)
        .attr('y', d => 4 + (d.posyTop + d.posyBottom) / 2)
        .attr('text-anchor', 'start')
        .attr('font-size', 12)
        .attr('stroke', '#fff')
        .attr('fill', '#fff')
        .attr('stroke-width', '4')
        .attr('stroke-linejoin', 'round')
        .attr('opacity', 1)
        .text(labelFunc);
      featureHoverLabels1.exit().remove();

      let featureHoverLabels2: d3.Selection<any, any, SVGGElement, {}> = this.hoverGroup2
        .selectAll('.pos-values')
        .data(posFeatures);
      featureHoverLabels2
        .enter()
        .append('text')
        .attr('class', 'pos-values')
        .merge(featureHoverLabels2)
        .attr('x', nearestExp.xmapScaled + 5)
        .attr('y', d => 4 + (d.posyTop + d.posyBottom) / 2)
        .attr('text-anchor', 'start')
        .attr('font-size', 12)
        .attr('fill', this.colors[0])
        .text(labelFunc);
      featureHoverLabels2.exit().remove();

      let featureHoverNegLabels1: d3.Selection<any, any, SVGGElement, {}> = this.hoverGroup1
        .selectAll('.neg-values')
        .data(negFeatures);
      featureHoverNegLabels1
        .enter()
        .append('text')
        .attr('class', 'neg-values')
        .merge(featureHoverNegLabels1)
        .attr('x', nearestExp.xmapScaled + 5)
        .attr('y', d => 4 + (d.negyTop + d.negyBottom) / 2)
        .attr('text-anchor', 'start')
        .attr('font-size', 12)
        .attr('stroke', '#fff')
        .attr('fill', '#fff')
        .attr('stroke-width', '4')
        .attr('stroke-linejoin', 'round')
        .attr('opacity', 1)
        .text(labelFunc);
      featureHoverNegLabels1.exit().remove();

      let featureHoverNegLabels2: d3.Selection<any, any, SVGGElement, {}> = this.hoverGroup2
        .selectAll('.neg-values')
        .data(negFeatures);
      featureHoverNegLabels2
        .enter()
        .append('text')
        .attr('class', 'neg-values')
        .merge(featureHoverNegLabels2)
        .attr('x', nearestExp.xmapScaled + 5)
        .attr('y', d => 4 + (d.negyTop + d.negyBottom) / 2)
        .attr('text-anchor', 'start')
        .attr('font-size', 12)
        .attr('fill', this.colors[1])
        .text(labelFunc);
      featureHoverNegLabels2.exit().remove();
    }
  }
}
